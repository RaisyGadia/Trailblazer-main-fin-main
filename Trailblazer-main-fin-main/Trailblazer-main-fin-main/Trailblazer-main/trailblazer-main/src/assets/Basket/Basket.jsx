import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Basket.css";
import uploadDelete from "../pages/img/delete.png";
import uploadCheck from "../pages/img/check.png";
import PDF from "../pages/img/PDF.png";
import DOC from "../pages/img/DOC.png";
import PPT from "../pages/img/PPT.png";
import PNG from "../pages/img/PNG.png";
import JPG from "../pages/img/JPG.png";
import {
  getStepConfig,
  getStepsWithActiveStates,
} from "../../utils/stepsConfig";
import BackButton from "../../components/BackButton/BackButton";
import {
  orderManager,
  getFileIcon,
  formatPrice,
} from "../../utils/dataManager";
import {
  getFirestore,
  getDocs,
  collection,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";

const deleteFileFromFirebase = async (uid, fileName) => {
  const db = getFirestore();
  const storage = getStorage();

  try {
    const filePath = `pending_service/PRINT/${uid}/${fileName}`;
    const fileRef = storageRef(storage, filePath);
    await deleteObject(fileRef);
    console.log(`✅ Deleted file '${fileName}' from storage`);

    const collectionRef = collection(db, "pending_service", "PRINT", uid);
    const q = query(collectionRef, where("fileName", "==", fileName));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
        console.log(`✅ Deleted Firestore document for '${fileName}'`);
      }
    } else {
      console.warn(`⚠️ No matching Firestore document found for '${fileName}'`);
    }
  } catch (error) {
    console.error("❌ Error deleting file from Firebase:", error);
  }
};

const Basket = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentOrderFromState = location.state?.currentOrder;
  const currentOrderFromManager = orderManager.getCurrentOrder();
  const currentOrder = currentOrderFromState || currentOrderFromManager;
  const templateData = location.state?.templateData || null;
  const isFromUpload = location.state?.fromUpload || false;

  const stepConfig = getStepConfig(templateData, location);
  const steps = getStepsWithActiveStates(stepConfig, "basket");

  const [basketItems, setBasketItems] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState({});
  const [totalPages, setTotalPages] = useState(0);

  const isFromLayoutSpecification = templateData && templateData.hasTemplate;

  const PRICES = {
    PRINTING: {
      "Black&White": {
        Short: 2,
        A4: 3,
        Long: 3,
      },
      "Full color": {
        Short: 10,
        A4: 12,
        Long: 12,
      },
    },
    CUSTOMIZATION: {
      None: 0,
      Basic: 100,
      High: 150,
    },
    RUSH_FEE: 7,
    LAYOUT_BASE_PRICE: 50,
    DELIVERY_FEE: 20,
  };

  useEffect(() => {
    try {
      if (location.state?.basketItems && location.state.basketItems.length > 0) {
        console.log("BASKET: Using basketItems from location state (back navigation)");
        setBasketItems(location.state.basketItems);
        if (location.state.orderDetails) {
          setOrderDetails(location.state.orderDetails);
        }
        showFeedback(`Basket restored with ${location.state.basketItems.length} item(s)`);
      } else if (location.state?.uploadedFiles && location.state.uploadedFiles.length > 0) {
        console.log("BASKET: Using uploadedFiles from UploadFiles");
        const uploaded = location.state.uploadedFiles;

        const basketItemsFromUpload = uploaded.map((file) => ({
          id: file.id,
          name: file.file.name,
          status: "Uploaded Successfully",
          icon: getFileIconImage(file.file.type),
          file: file.file,
          pageCount: file.pageCount,
          isTemplate: false,
          specifications: file.specifications,
          pricing: null,
        }));

        setBasketItems(basketItemsFromUpload);
        setOrderDetails(location.state.orderDetails || {});
        showFeedback(`Basket initialized with ${basketItemsFromUpload.length} uploaded file(s)`);
      } else if (currentOrder && currentOrder.files && currentOrder.files.length > 0) {
        const basketItemsFromOrder = currentOrder.files.map((file) => ({
          id: file.id,
          name: file.fileName,
          status: "Uploaded Successfully",
          icon: getFileIconImage(file.fileType),
          file: {
            name: file.fileName,
            type: file.fileType,
            size: file.fileSize,
          },
          pageCount: file.pageCount,
          isTemplate: false,
          specifications: file.specifications,
          pricing: file.pricing,
        }));

        setBasketItems(basketItemsFromOrder);
        setOrderDetails({
          paperSize: "",
          printOption: "",
          turnaroundTime: currentOrder.turnaroundTime,
          paymentMethod: currentOrder.paymentMethod,
          emailAddress: currentOrder.customerEmail,
          phoneNumber: currentOrder.customerPhone,
          price: currentOrder.totalAmount.toFixed(2),
          customization: "None",
          deliveryMethod: currentOrder.deliveryMethod,
          notes: currentOrder.notes,
        });

        showFeedback(`Basket loaded with ${basketItemsFromOrder.length} file(s)`);
      } else if (templateData && templateData.hasTemplate) {
        console.log("BASKET: Initializing from template data.", templateData);
        const templateItem = {
          id: `template-${templateData.templateId}-${Date.now()}`,
          name: templateData.title || `Template ${templateData.templateId}`,
          status: "Template Selected",
          icon: PDF,
          file: null,
          pageCount: 1,
          isTemplate: true,
          templateId: templateData.templateId,
          templateType: templateData.templateType,
          specifications: templateData.specifications || null,
          turnaroundTime: templateData.turnaroundTime || null,
        };

        setBasketItems([templateItem]);
        setOrderDetails({
          paperSize: templateData.specifications?.paperSize || "",
          printOption: templateData.specifications?.printOption || "",
          turnaroundTime: templateData.turnaroundTime || "Standard",
          paymentMethod: "cash",
          emailAddress: "",
          phoneNumber: "",
          price: PRICES.LAYOUT_BASE_PRICE.toFixed(2),
          customization: templateData.specifications?.customization || "None",
          templateType: templateData.templateType,
          hasTemplate: true,
        });

        showFeedback(`Template ${templateItem.name} added to basket`);
      } else {
        if (location.state?.basketItems && location.state.basketItems.length === 0) {
          console.log("BASKET: Restored empty basket from back navigation");
          setBasketItems([]);
          setOrderDetails(location.state.orderDetails || {
            paperSize: "",
            printOption: "",
            turnaroundTime: "Standard",
            paymentMethod: "cash",
            emailAddress: "",
            phoneNumber: "",
            price: "0.00",
            customization: "None",
          });
        } else {
          console.log("BASKET: No current order or files, showing empty basket");
          setBasketItems([]);
          setOrderDetails({
            paperSize: "",
            printOption: "",
            turnaroundTime: "Standard",
            paymentMethod: "cash",
            emailAddress: "",
            phoneNumber: "",
            price: "0.00",
            customization: "None",
          });
        }
      }
    } catch (error) {
      console.error("BASKET: Error during initialization:", error);

      if (location.state?.basketItems) {
        console.log("BASKET: Error recovery using location state");
        setBasketItems(location.state.basketItems);
        setOrderDetails(location.state.orderDetails || {
          paperSize: "",
          printOption: "",
          turnaroundTime: "Standard",
          paymentMethod: "cash",
          emailAddress: "",
          phoneNumber: "",
          price: "0.00",
          customization: "None",
        });
      } else {
        setBasketItems([]);
        setOrderDetails({
          paperSize: "",
          printOption: "",
          turnaroundTime: "Standard",
          paymentMethod: "cash",
          emailAddress: "",
          phoneNumber: "",
          price: "0.00",
          customization: "None",
        });
      }
    }
  }, [currentOrder, templateData]);

  // Calculate total pages whenever basketItems change
  useEffect(() => {
    const newTotalPages = basketItems.reduce(
      (total, item) => total + (item.pageCount || 1),
      0
    );
    setTotalPages(newTotalPages);
  }, [basketItems]);

  // Calculate price based on specifications and file page counts
  const calculatePrice = (items, details, templateType) => {
    let totalPrice = 0;

    items.forEach((item) => {
      const itemSpecs = item.specifications || details;

      if (
        item.isTemplate &&
        (templateType === "layout" || item.templateType === "layout")
      ) {
        totalPrice += PRICES.LAYOUT_BASE_PRICE;

        if (itemSpecs.turnaroundTime === "Rush") {
          totalPrice += PRICES.RUSH_FEE;
        }
        if (itemSpecs.customization && itemSpecs.customization !== "None") {
          totalPrice += PRICES.CUSTOMIZATION[itemSpecs.customization];
        }
      } else if (item.isTemplate) {
        if (
          item.templateType === "presentation" ||
          item.templateType === "poster"
        ) {
          totalPrice += 50;
        } else if (item.templateType === "resume") {
          totalPrice += 30;
        } else {
          totalPrice += 25;
        }

        if (itemSpecs.turnaroundTime === "Rush") {
          totalPrice += PRICES.RUSH_FEE;
        }
      } else {
        const normalizedPrintOption = itemSpecs.printOption;

        if (itemSpecs.paperSize && normalizedPrintOption) {
          const basePrice =
            PRICES.PRINTING[normalizedPrintOption]?.[itemSpecs.paperSize] || 0;
          totalPrice += basePrice * (item.pageCount || 1);

          if (itemSpecs.turnaroundTime === "Rush") {
            totalPrice += PRICES.RUSH_FEE;
          }
        }
      }
    });

    return totalPrice.toFixed(2);
  };

  useEffect(() => {
    if (basketItems.length > 0 || templateData?.templateType === "layout") {
      setOrderDetails((prev) => ({
        ...prev,
        price: calculatePrice(basketItems, prev, templateData?.templateType),
      }));
    } else {
      setOrderDetails((prev) => ({
        ...prev,
        price: "0.00",
      }));
    }
  }, [
    orderDetails.paperSize,
    orderDetails.printOption,
    orderDetails.turnaroundTime,
    orderDetails.customization,
    templateData?.templateType,
  ]);

  const showFeedback = (message) => {
    setFeedbackMessage(message);
    setTimeout(() => {
      setFeedbackMessage("");
    }, 3000);
  };

  const updateItemSpecifications = (itemId, newSpecifications) => {
    setBasketItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              specifications: {
                ...item.specifications,
                ...newSpecifications,
              },
            }
          : item
      )
    );

    const updatedItems = basketItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            specifications: {
              ...item.specifications,
              ...newSpecifications,
            },
          }
        : item
    );

    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      price: calculatePrice(
        updatedItems,
        prevDetails,
        templateData?.templateType
      ),
    }));

    showFeedback("Item specifications updated");
  };

  const handleDeleteItem = async (itemId) => {
    const itemToDelete = basketItems.find((item) => item.id === itemId);
    const user = getAuth().currentUser;

    if (!itemToDelete) return;

    if (!itemToDelete.isTemplate && user) {
      try {
        await deleteFileFromFirebase(user.uid, itemToDelete.name);
      } catch (error) {
        console.error("Error deleting file from Firebase:", error);
      }
    }

    setBasketItems((prev) => {
      const newItems = prev.filter((item) => item.id !== itemId);
      const newPrice = calculatePrice(
        newItems,
        orderDetails,
        templateData?.templateType
      );

      if (newItems.length === 0) {
        orderManager.clearCurrentOrder();
        setOrderDetails({
          paperSize: "",
          printOption: "",
          turnaroundTime: "Standard",
          paymentMethod: "",
          customization: "None",
          price: "0.00",
        });
      } else {
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          price: newPrice,
        }));
        orderManager.updateOrderDetails({ totalAmount: parseFloat(newPrice) });
      }

      return newItems;
    });

    if (!itemToDelete.isTemplate) {
      orderManager.removeFileFromOrder(itemId);
    }

    showFeedback("Item removed from basket");
  };

  const handleAddFiles = () => {
    orderManager.updateOrderDetails({
      totalAmount: parseFloat(orderDetails.price || "0.00"),
      turnaroundTime: orderDetails.turnaroundTime,
      paymentMethod: orderDetails.paymentMethod,
      deliveryMethod: orderDetails.deliveryMethod,
      notes: orderDetails.notes || "",
    });

    const comprehensiveSpecifications = {
      ...orderDetails,
      templateType: orderDetails.templateType || templateData?.templateType,
      hasTemplate:
        orderDetails.hasTemplate || templateData?.hasTemplate || false,
      templateNotes: templateData?.notes || orderDetails.templateNotes,
      templateTurnaroundTime:
        templateData?.turnaroundTime || orderDetails.templateTurnaroundTime,
      totalFiles: basketItems.filter((item) => !item.isTemplate).length,
      totalPrice: orderDetails.price,
    };

    navigate("/upload", {
      state: {
        files: basketItems
          .filter((item) => !item.isTemplate)
          .map((item) => ({
            id: item.id,
            name: item.name,
            type: item.file?.type,
            size: item.file?.size,
            lastModified: item.file?.lastModified,
            pageCount: item.pageCount || 1,
            isTemplate: item.isTemplate || false,
            specifications: item.specifications || comprehensiveSpecifications,
            templateType: item.templateType || orderDetails.templateType,
          })),
        specifications: comprehensiveSpecifications,
        basketItems: basketItems,
        orderDetails: orderDetails,
        templateInfo: templateData
          ? {
              templateId: templateData.templateId,
              notes: templateData.notes || orderDetails.notes,
              turnaroundTime:
                templateData.turnaroundTime || orderDetails.turnaroundTime,
              title: templateData.title,
              description: templateData.description,
              templateType:
                templateData.templateType || orderDetails.templateType,
              imageSrc: templateData.imageSrc,
            }
          : null,
        templateData: templateData
          ? {
              ...templateData,
              templateType:
                templateData.templateType || orderDetails.templateType,
              hasTemplate: templateData.hasTemplate || orderDetails.hasTemplate,
            }
          : null,
        fromBasket: true,
        uploadMetadata: {
          timestamp: Date.now(),
          fromBasket: true,
          basketItemCount: basketItems.length,
          templateType: orderDetails.templateType || templateData?.templateType,
          hasTemplate:
            orderDetails.hasTemplate || templateData?.hasTemplate || false,
        },
      },
    });
  };

  const getFileIconImage = (fileType) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return PDF;
    if (type.includes("doc")) return DOC;
    if (type.includes("ppt")) return PPT;
    if (type.includes("png")) return PNG;
    if (type.includes("jpg") || type.includes("jpeg")) return JPG;
    return PDF;
  };

  const handleNextClick = () => {
    const normalizedOrderDetails = {
      ...orderDetails,
      price:
        orderDetails.price ||
        calculatePrice(basketItems, orderDetails, templateData?.templateType),
    };

    orderManager.updateOrderDetails({
      totalAmount: parseFloat(normalizedOrderDetails.price),
      turnaroundTime: normalizedOrderDetails.turnaroundTime,
      paymentMethod: normalizedOrderDetails.paymentMethod,
      deliveryMethod: normalizedOrderDetails.deliveryMethod,
      notes: normalizedOrderDetails.notes || "",
    });

    navigate("/delivery", {
      state: {
        basketItems,
        orderDetails: normalizedOrderDetails,
        specifications: normalizedOrderDetails,
        templateData,
      },
    });
  };

  const renderOrderDetails = () => {
    return (
      <div className="bs-order-details">
        {(templateData?.templateType !== "layout" || !templateData) && (
          <div>{orderDetails.paperSize}</div>
        )}
        {(templateData?.templateType !== "layout" || !templateData) && (
          <div>{orderDetails.printOption}</div>
        )}
        {templateData?.templateType === "layout" && <div>Layout Design</div>}
        <div>
          {templateData?.turnaroundTime ||
            orderDetails.turnaroundTime ||
            "Standard"}
        </div>
        <div>{orderDetails.paymentMethod}</div>
        {templateData?.templateType === "layout" &&
          orderDetails.customization &&
          orderDetails.customization !== "None" && (
            <div>{orderDetails.customization}</div>
          )}
      </div>
    );
  };

  const renderItemDetails = (item) => {
    const itemSpecs = item.specifications || orderDetails;

    const itemPrice = (item) => {
      const specs = item.specifications || orderDetails;
      let totalItemPrice = 0;
      let rushFee = 0;

      if (item.isTemplate) {
        if (
          templateData?.templateType === "layout" ||
          item.templateType === "layout"
        ) {
          totalItemPrice = PRICES.LAYOUT_BASE_PRICE;
        } else if (
          item.templateType === "presentation" ||
          item.templateType === "poster"
        ) {
          totalItemPrice = 50;
        } else if (item.templateType === "resume") {
          totalItemPrice = 30;
        } else {
          totalItemPrice = 25;
        }

        if (specs.turnaroundTime === "Rush") {
          rushFee = PRICES.RUSH_FEE;
          totalItemPrice += rushFee;
        }

        return totalItemPrice.toFixed(2);
      }

      if (!item.isTemplate && specs.paperSize && specs.printOption) {
        const basePrice =
          PRICES.PRINTING[specs.printOption]?.[specs.paperSize] || 0;
        const baseTotalPrice = basePrice * (item.pageCount || 1);
        totalItemPrice = baseTotalPrice;

        if (specs.turnaroundTime === "Rush") {
          rushFee = PRICES.RUSH_FEE;
          totalItemPrice += rushFee;
        }

        return totalItemPrice.toFixed(2);
      }

      return "0.00";
    };

    return (
      <div className="bs-order-details">
        {((templateData?.templateType !== "layout" &&
          item.templateType !== "layout") ||
          (!templateData && !item.templateType)) && (
          <div>{itemSpecs.paperSize}</div>
        )}
        {((templateData?.templateType !== "layout" &&
          item.templateType !== "layout") ||
          (!templateData && !item.templateType)) && (
          <div>{itemSpecs.printOption}</div>
        )}
        {(templateData?.templateType === "layout" ||
          item.templateType === "layout") && <div>Layout Design</div>}
        <div>
          {item.turnaroundTime ||
            templateData?.turnaroundTime ||
            itemSpecs.turnaroundTime ||
            "Standard"}
        </div>
        <div>{itemSpecs.paymentMethod}</div>
        {(templateData?.templateType === "layout" ||
          item.templateType === "layout") &&
          itemSpecs.customization &&
          itemSpecs.customization !== "None" && (
            <div>{itemSpecs.customization}</div>
          )}
        {!item.isTemplate && item.pageCount > 1 && (
          <div className="bs-page-info">
            <p>Pages: {item.pageCount}</p>
          </div>
        )}
        <div className="bs-summary-price">
          <span> ₱{itemPrice(item)}</span>
        </div>
      </div>
    );
  };

  const handleBack = () => {
    if (templateData && templateData.hasTemplate) {
      navigate(`/template/${templateData.templateId}/specification`, {
        state: {
          templateInfo: {
            ...templateData,
            templateId: templateData.templateId,
            notes: templateData.notes,
            turnaroundTime:
              templateData.turnaroundTime || orderDetails.turnaroundTime,
            templateType: templateData.templateType,
            title: templateData.title,
            description: templateData.description,
            imageSrc: templateData.imageSrc,
          },
          specifications: orderDetails,
        },
      });
    } else {
      navigate("/upload", {
        state: {
          files: basketItems.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.file?.type,
            size: item.file?.size,
            lastModified: item.file?.lastModified,
            pageCount: item.pageCount || 1,
            isTemplate: item.isTemplate || false,
          })),
          specifications: orderDetails,
          templateInfo: templateData
            ? {
                templateId: templateData.templateId,
                notes: templateData.notes,
                turnaroundTime:
                  templateData.turnaroundTime || orderDetails.turnaroundTime,
                title: templateData.title,
                description: templateData.description,
                templateType: templateData.templateType,
              }
            : null,
          templateData,
        },
      });
    }
  };

  const renderEmptyBasket = () => (
    <div className="bs-empty-basket bs-card">
      <div className="bs-empty-content">
        <h3>Your basket is empty</h3>
        <p>Add files or select a template to get started with your order</p>
        {!isFromLayoutSpecification && (
          <button
            className="bs-add-btn bs-empty-add-btn"
            onClick={handleAddFiles}
          >
            Add Files
          </button>
        )}
        <button
          className="bs-add-btn bs-empty-add-btn"
          onClick={() => navigate("/upload")}
          style={{ marginLeft: "10px" }}
        >
          Go to Upload
        </button>
      </div>
    </div>
  );

  return (
    <div className="bs-wrapper">
      {feedbackMessage && (
        <div className="bs-feedback-message">{feedbackMessage}</div>
      )}

      <BackButton onClick={handleBack} />

      <div className="bs-steps">
        <div className="bs-step-circles">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {index > 0 && (
                <div
                  className={`bs-line ${
                    steps[index - 1].active ? "active" : ""
                  }`}
                ></div>
              )}
              <div className={`bs-step-circle ${step.active ? "active" : ""}`}>
                <span className="bs-step-num">{step.number}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="bs-step-labels">
          {steps.map((step) => (
            <div key={`label-${step.number}`} className="bs-step-label">
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <h2 className="bs-title">Your Basket ({basketItems.length})</h2>

      <div className="bs-main">
        {basketItems.length > 0 ? (
          <>
            {basketItems.map((item) => (
              <div key={item.id} className="bs-item-card-group">
                <div className="bs-basket-component-container">
                  <div className="bs-basket-item-wrapper">
                    <div className="bs-basket-card bs-card">
                      <div className="bs-basket-item-container">
                        <div className="bs-basket-item">
                          <img
                            src={item.icon}
                            alt="File icon"
                            className="bs-file-icon"
                          />
                          <div className="bs-file-info">
                            <p className="bs-file-name">
                              {item.name}
                              {item.isTemplate && (
                                <span
                                  style={{
                                    color: "#1C7ED6",
                                    marginLeft: "6px",
                                  }}
                                >
                                  (Template)
                                </span>
                              )}
                            </p>
                            <p className="bs-file-status">
                              {item.status}
                              {!item.isTemplate &&
                                item.pageCount > 1 &&
                                ` • ${item.pageCount} pages`}
                              {item.isTemplate &&
                                ` • ${
                                  templateData?.templateType || "Template"
                                }`}
                            </p>
                          </div>
                          <img
                            src={uploadCheck}
                            alt="Done"
                            className="bs-status-icon"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="bs-delete-btn bs-delete-btn-external"
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label="Delete item"
                    title="Remove item"
                  >
                    <img src={uploadDelete} alt="Delete" />
                  </button>
                </div>

                <div className="bs-summary-card bs-card">
                  <div className="bs-summary-info">
                    {renderItemDetails(item)}
                  </div>
                </div>
              </div>
            ))}

            <div className="bs-footer">
              <div className="bs-footer-left">
                {!isFromLayoutSpecification && (
                  <button className="bs-add-btn" onClick={handleAddFiles}>
                    Add files
                  </button>
                )}
              </div>

              <div className="bs-footer-right">
                <div className="bs-subtotal">
                  <span>Sub-Total Amount: ₱{orderDetails.price}</span>
                </div>

                <button
                  className="bs-next-btn"
                  onClick={handleNextClick}
                  disabled={basketItems.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          renderEmptyBasket()
        )}
      </div>
    </div>
  );
};

export default Basket;
