import sequelize from "../config/db.js";
import ApprovedLicense from "../models/approvedLicenseModel.js";

const seedLicenses = async () => {
  try {
    await sequelize.authenticate();
    await ApprovedLicense.bulkCreate([
      {
        governmentLicenseId: "AYUSH0001",
        doctorName: "Dr Sharma",
      },
      {
        governmentLicenseId: "AYUSH0002",
        doctorName: "Dr Mehta",
      },
      {
        governmentLicenseId: "AYUSH0003",
        doctorName: "Dr Verma",
      },
      {
        governmentLicenseId: "AYUSH0004",
        doctorName: "Dr Singh",
      },
      {
        governmentLicenseId: "AYUSH0005",
        doctorName: "Dr Kumar",
      },
    ]);
    console.log("Licenses seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedLicenses();
