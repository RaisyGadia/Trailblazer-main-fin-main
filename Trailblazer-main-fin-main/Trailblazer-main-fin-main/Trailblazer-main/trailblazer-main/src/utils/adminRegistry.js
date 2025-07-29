// Admin Registry Management Utility Functions

export const adminRegistry = {
  // Get all registered admins
  getAll: () => {
    try {
      return JSON.parse(localStorage.getItem("adminRegistry")) || [];
    } catch (error) {
      console.error("Error reading admin registry:", error);
      return [];
    }
  },

  // Get admin by email
  getByEmail: (email) => {
    const registry = adminRegistry.getAll();
    return registry.find((admin) => admin.email === email);
  },

  // Add new admin to registry
  add: (adminData) => {
    const registry = adminRegistry.getAll();
    const existingIndex = registry.findIndex(
      (admin) => admin.email === adminData.email
    );

    const adminWithTimestamp = {
      ...adminData,
      createdAt:
        existingIndex === -1
          ? new Date().toISOString()
          : registry[existingIndex].createdAt,
      lastUpdated: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      // Update existing admin
      registry[existingIndex] = adminWithTimestamp;
    } else {
      // Add new admin
      registry.push(adminWithTimestamp);
    }

    try {
      localStorage.setItem("adminRegistry", JSON.stringify(registry));
      return true;
    } catch (error) {
      console.error("Error saving admin registry:", error);
      return false;
    }
  },

  // Check if admin exists
  exists: (email) => {
    return adminRegistry.getByEmail(email) !== undefined;
  },

  // Get total count of registered admins
  getCount: () => {
    return adminRegistry.getAll().length;
  },

  // Remove admin from registry (if needed)
  remove: (email) => {
    const registry = adminRegistry.getAll();
    const filteredRegistry = registry.filter((admin) => admin.email !== email);

    try {
      localStorage.setItem("adminRegistry", JSON.stringify(filteredRegistry));
      return true;
    } catch (error) {
      console.error("Error removing admin from registry:", error);
      return false;
    }
  },

  // Clear entire registry (if needed)
  clear: () => {
    try {
      localStorage.removeItem("adminRegistry");
      return true;
    } catch (error) {
      console.error("Error clearing admin registry:", error);
      return false;
    }
  },
};
