import React, { useRef, useState, useEffect } from "react";
import "./UploadFiles.css";
import uploadImage from "../pages/img/upload.png";
import uploadPeso from "../pages/img/peso.png";
import PDF from "../pages/img/PDF.png";
import DOC from "../pages/img/DOC.png";
import PPT from "../pages/img/PPT.png";
import PNG from "../pages/img/PNG.png";
import JPG from "../pages/img/JPG.png";
import { useNavigate, useLocation } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import BackButton from "../../components/BackButton/BackButton";
import {
  orderManager,
  getFileIcon,
  formatPrice,
} from "../../utils/dataManager";
import { getAuth } from "firebase/auth";

// Rest of your component
export const UploadFiles = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state || {};
  const previousFiles = previousState.files || [];
  const previousSpecifications = previousState.specifications || {};

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const steps = [
    { number: 1, label: "Upload", active: true },
    { number: 2, label: "Basket", active: false },
    { number: 3, label: "Delivery", active: false },
    { number: 4, label: "Payment", active: false },
  ];

  const [specifications, setSpecifications] = useState({
    paperSize: previousSpecifications.paperSize || "",
    printOption: previousSpecifications.printOption || "",
    turnaroundTime: previousSpecifications.turnaroundTime || "Standard",
    paymentMethod: previousSpecifications.paymentMethod || "",
    notes: previousSpecifications.notes || "",
    emailAddress: previousSpecifications.emailAddress || "",
    phoneNumber: previousSpecifications.phoneNumber || "",
    selectedTemplate: previousSpecifications.selectedTemplate || "", 
  });


  const getPdfPageCount = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error("Error counting PDF pages:", error);
      return 1;
    }
  };

  const handleBack = () => navigate("/");


useEffect(() => {
  const isRestoring = previousState.fromBasket && previousFiles.length > 0;

  if (isRestoring) {
    const order = orderManager.getCurrentOrder();
    const alreadyInOrder = new Set(order?.files?.map((f) => f.id) || []);

    const restoredFiles = previousFiles
      .filter((fileInfo) => !alreadyInOrder.has(fileInfo.id))
      .map((fileInfo) => {
        const placeholderFile = {
          name: fileInfo.name,
          type: fileInfo.type,
          size: fileInfo.size,
          lastModified: fileInfo.lastModified,
        };
        return {
          file: placeholderFile,
          id: fileInfo.id,
          pageCount: fileInfo.pageCount || 1,
          specifications: fileInfo.specifications || { ...previousSpecifications },
        };
      });

    if (restoredFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...restoredFiles]);
      setUploadProgress((prev) => {
        const updated = { ...prev };
        restoredFiles.forEach((file) => {
          updated[file.id] = 100;
        });
        return updated;
      });
    }
  }
}, []);

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
  };

  const calculateCurrentUploadPrice = () => {
    if (selectedFiles.length === 0) return 0;
    let total = 0;

    selectedFiles.forEach((fileObj) => {
      const specs = fileObj.specifications;
      if (specs.paperSize && specs.printOption) {
        const base = PRICES.PRINTING[specs.printOption]?.[specs.paperSize] || 0;
        const rush = specs.turnaroundTime === "Rush" ? PRICES.RUSH_FEE : 0;
        total += base * (fileObj.pageCount || 1) + rush;
      }
    });

    return total;
  };

const calculatePrice = () => {
  return selectedFiles.length === 0 ? "00.00" : calculateCurrentUploadPrice().toFixed(2);
};

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleBrowseClick = () => fileInputRef.current.click();

  const simulateUpload = (fileId) => {
    setUploadProgress((prev) => ({
      ...prev,
      [fileId]: 0,
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: progress,
      }));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleFileSelection = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);

    const allowedTypes = [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "application/vnd.ms-powerpoint", 
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", 
      "image/png",
      "image/jpeg", 
    ];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length < files.length) {
      alert(
        "Some files were not added. Only PDF, DOC, DOCX, PPT, PPTX, PNG, and JPG files are allowed."
      );
    }

    if (validFiles.length === 0) {
      setIsProcessingFiles(false);
      return;
    }

    const processedFiles = [];

    for (const file of validFiles) {

      let pageCount = 1;
      if (file.type === "application/pdf") {
        try {
          pageCount = await getPdfPageCount(file);
          console.log(`PDF ${file.name} has ${pageCount} pages`);
        } catch (error) {
          console.error("Error counting PDF pages:", error);
        }
      }

const inheritedSpecs = previousState.fromBasket
  ? {
      paperSize: previousSpecifications.paperSize || specifications.paperSize,
      printOption:
        previousSpecifications.printOption || specifications.printOption,
      colorMode:
        previousSpecifications.printOption || specifications.printOption,
      turnaroundTime:
        previousSpecifications.turnaroundTime ||
        specifications.turnaroundTime,
      customization:
        previousSpecifications.customization || "None",
      paymentMethod:
        previousSpecifications.paymentMethod || specifications.paymentMethod,
      notes: previousSpecifications.notes || "",
      pageCount: pageCount,
    }
  : {
      paperSize: specifications.paperSize,
      printOption: specifications.printOption,
      colorMode: specifications.printOption,
      turnaroundTime: specifications.turnaroundTime,
      customization: "None",
      notes: specifications.notes,
      paymentMethod: specifications.paymentMethod,
      pageCount: pageCount,
    };


    const fileData = orderManager.addFileToOrder(file, inheritedSpecs);


      processedFiles.push({
        file,
        id: fileData.id,
        pageCount: pageCount,
        specifications: fileData.specifications,
      });

      simulateUpload(fileData.id);
    }

    setSelectedFiles((prev) => [...prev, ...processedFiles]);
    setIsProcessingFiles(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(Array.from(e.target.files));
    }
  };

const handleSpecChange = (label, value) => {
  setSpecifications((prevSpecs) => ({
    ...prevSpecs,
    [label]: value,
  }));

  setSelectedFiles((prevFiles) =>
    prevFiles.map((fileObj) => ({
      ...fileObj,
      specifications: {
        ...fileObj.specifications,
        [label]: value,
      },
    }))
  );
};

  const handleFileSpecChange = (fileId, specType, value) => {

    const updateObj = { [specType]: value };
    if (specType === "printOption") {
      updateObj.colorMode = value; 
    }

    orderManager.updateFileSpecifications(fileId, updateObj);

    setSelectedFiles((prev) =>
      prev.map((fileObj) => {
        if (fileObj.id === fileId) {
          return {
            ...fileObj,
            specifications: {
              ...fileObj.specifications,
              ...updateObj,
            },
          };
        }
        return fileObj;
      })
    );
  };

  const removeFile = (fileId) => {
    orderManager.removeFileFromOrder(fileId);

    setSelectedFiles((prev) => prev.filter((fileObj) => fileObj.id !== fileId));

    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

const auth = getAuth();


const handleConfirmClick = async () => {
  const currentOrder = orderManager.getCurrentOrder();
  const user = auth.currentUser;

  if (!user) {
    alert("You must be signed in to proceed.");
    return;
  }

  const uid = user.uid;

  if (!currentOrder || selectedFiles.length === 0) {
    alert("Please upload at least one file before proceeding.");
    return;
  }

  const updatedFiles = selectedFiles.map((fileObj) => ({
  ...fileObj,
  specifications: {
    ...fileObj.specifications,
    paperSize: specifications.paperSize,
    printOption: specifications.printOption,
    turnaroundTime: specifications.turnaroundTime,
    paymentMethod: specifications.paymentMethod,
    customization: specifications.customization || "None",
  },
}));


  setSelectedFiles(updatedFiles);

  const incompleteFiles = updatedFiles.filter(
    (file) =>
      !file.specifications?.paperSize || !file.specifications?.printOption
  );

  if (incompleteFiles.length > 0) {
    alert("Complete all file specifications before proceeding.");
    return;
  }

  const effectivePaymentMethod =
    specifications.paymentMethod || currentOrder?.paymentMethod || "";

  if (!effectivePaymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  if (isProcessingFiles) {
    alert("Please wait until all files are processed.");
    return;
  }

  const orderDetails = {
    paymentMethod: effectivePaymentMethod,
    turnaroundTime: specifications.turnaroundTime,
    notes: specifications.notes || "",
    customerEmail: specifications.emailAddress || "",
    customerPhone: specifications.phoneNumber || "",
    totalAmount: calculatePrice(),
    fromBasket: previousState.fromBasket || false,
    additionalCost: previousState.fromBasket ? calculatePrice() : null,
    fileCount: updatedFiles.length,
    uploadSession: {
      timestamp: new Date().toISOString(),
      sessionFiles: updatedFiles.map((f) => ({
        id: f.id,
        name: f.file.name,
        pageCount: f.pageCount,
        specifications: f.specifications,
      })),
    },
  };

  orderManager.updateOrderDetails(orderDetails);

  const existingBasketItems = previousState.basketItems || [];

navigate("/basket", {
  state: {
    currentOrder: orderManager.getCurrentOrder(),
    fromUpload: true,
    orderDetails,
    paymentMethod: effectivePaymentMethod,
    uploadedFiles: [...existingBasketItems, ...updatedFiles],
    sessionCost: calculatePrice(),
  },
});
};


  const getSpecFields = () => {
    const fields = [
      {
        label: "Paper size:",
        options: ["A4", "Short", "Long"],
        stateKey: "paperSize",
      },
      {
        label: "Printing options:",
        options: ["Full color", "Black&White"],
        stateKey: "printOption",
      },
      {
        label: "Turnaround Time:",
        options: ["Standard", "Rush"],
        stateKey: "turnaroundTime",
      },
    ];

    const currentOrder = orderManager.getCurrentOrder();
    const isFromBasket = previousState.fromBasket || false;
    const hasExistingPaymentMethod =
      currentOrder?.paymentMethod && currentOrder?.files?.length > 0;

    if (!isFromBasket || !hasExistingPaymentMethod) {
      fields.push({
        label: "Payment method:",
        options: ["Cash on Delivery", "Gcash"],
        stateKey: "paymentMethod",
      });
    }

    return fields;
  };

  const specs = getSpecFields();

  const existingBasketItems = previousState.basketItems || [];
  const isFromBasket = previousState.fromBasket || false;
  const existingFileCount = isFromBasket
    ? existingBasketItems.filter((item) => !item.isTemplate).length
    : 0;
  const totalFileCount = selectedFiles.length + existingFileCount;

  return (
    <div className="uf-container">
      <main className="uf-main">
        <BackButton onClick={handleBack} />

        <div className="uf-steps">
          <div className="uf-step-circles">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {index > 0 && (
                  <div
                    className={`uf-line ${
                      steps[index - 1].active ? "active" : ""
                    }`}
                  ></div>
                )}
                <div
                  className={`uf-step-circle ${step.active ? "active" : ""}`}
                >
                  <span className="uf-step-num">{step.number}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="uf-step-labels">
            {steps.map((step) => (
              <div key={`label-${step.number}`} className="uf-step-label">
                {step.label}
              </div>
            ))}
          </div>
        </div>

        <h2 className="uf-title">Upload Files</h2>
        <p className="uf-subtitle">Upload your files you want to print</p>

        <div className="uf-content">
          <div
            className={`uf-upload-box ${
              selectedFiles.length > 0 ? "has-files" : ""
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFiles.length > 0 ? (
  <div className="uf-file-preview">
    <h3 className="uf-preview-title">
      Uploaded Files ({selectedFiles.length})
    </h3>

    <div className="uf-files-list">
      {selectedFiles.map((fileObj) => (
        <div key={fileObj.id} className="uf-file-item">
          <span className="uf-remove-file" onClick={() => removeFile(fileObj.id)}>
            &times;
          </span>
          <div className="uf-file-details">
            <div className="uf-progress-bar-wrapper">
              <div
                className="uf-progress-bar"
                style={{
                  width: `${uploadProgress[fileObj.id] || 0}%`,
                }}
              >
                {fileObj.file.name} ({fileObj.pageCount} pages)
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button className="uf-btn-browse" onClick={handleBrowseClick}>
      ADD MORE FILES
    </button>

    <p className="uf-accepted-label">Accepted file types</p>
    <div className="uf-file-icons">
      <img src={PDF} alt="PDF" />
      <img src={DOC} alt="DOC" />
      <img src={PPT} alt="PPT" />
      <img src={JPG} alt="JPG" />
      <img src={PNG} alt="PNG" />
    </div>
  </div>
) : (
  <>
    <img
      src={uploadImage}
      alt="upload"
      className="uf-upload-icon"
    />
    <p className="uf-upload-text">
      Drag and drop files here
      <br />
      or
    </p>
    <button className="uf-btn-browse" onClick={handleBrowseClick}>
      BROWSE FILES
    </button>
  </>
)}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              multiple
            />
          </div>
          <div className="uf-card">
            <h2 className="uf-card-title">SPECIFICATION</h2>

            <div className="uf-specs">
              {specs.map((spec, index) => (
                <div key={index} className="uf-spec-item">
                  <p className="uf-spec-label">{spec.label}</p>
                  <select
                    className="uf-spec-trigger"
                    value={specifications[spec.stateKey]}
                    onChange={(e) =>
                      handleSpecChange(spec.stateKey, e.target.value)
                    }
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    {spec.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {specifications[spec.stateKey] && (
                    <div className="uf-selected-value"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="uf-payment-section">
              <div className="uf-payment-info">
                <p className="uf-payment-label">
                  {isFromBasket ? "ADDITIONAL COST:" : "PAYMENT:"}
                </p>
                <div className="uf-payment-amount">
                  <img
                    src={uploadPeso}
                    alt="Currency"
                    className="uf-payment-icon"
                  />
                  <span className="uf-payment-value">{calculatePrice()}</span>
                </div>
              </div>
              <div className="uf-confirm-btn-wrapper">
                <button
                  className="uf-btn-primary"
                  onClick={handleConfirmClick}
                  disabled={isProcessingFiles}
                  style={{
                    backgroundColor: "#1C7ED6",
                    color: "white",
                    borderRadius: "2rem",
                    padding: "0.7rem 2rem",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {isProcessingFiles ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default UploadFiles;
