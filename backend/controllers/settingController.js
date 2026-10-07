const SchoolSetting = require("../models/SchoolSetting");
const User = require("../models/User");
const cloudinary = require(
  "../config/cloudinary"
);

const allowedSchoolSettingFields = [
  "schoolName",
  "address",
  "phone",
  "email",
  "website",
  "principalName",
  "academicSession",
  "schoolCode",
  "affiliationNumber",
];

const getAllowedSchoolSettingData = (
  body = {}
) => {
  const data = {};

  for (const field of allowedSchoolSettingFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      data[field] = body[field];
    }
  }

  return data;
};

// Get School Settings
const getSchoolSettings = async (req, res) => {
  try {
    const settings = await SchoolSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "School settings not found",
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create School Settings
const createSchoolSettings = async (
  req,
  res
) => {
  try {
    const existingSettings =
      await SchoolSetting.findOne();

    if (existingSettings) {
      return res.status(409).json({
        success: false,
        message:
          "School settings already exist",
      });
    }

    const settingData =
      getAllowedSchoolSettingData(
        req.body
      );

    if (
      !settingData.schoolName ||
      !String(
        settingData.schoolName
      ).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "School name is required",
      });
    }

    settingData.schoolName =
      String(
        settingData.schoolName
      ).trim();

    const settings =
      await SchoolSetting.create(
        settingData
      );

    return res.status(201).json({
      success: true,
      message:
        "School settings created successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Create school settings failed"
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid school settings data",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create school settings",
    });
  }
};

// Update School Settings
const updateSchoolSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await SchoolSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message:
          "School settings not found",
      });
    }

    const updateData =
      getAllowedSchoolSettingData(
        req.body
      );

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid settings fields provided",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "schoolName"
      )
    ) {
      if (
        !updateData.schoolName ||
        !String(
          updateData.schoolName
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "School name is required",
        });
      }

      updateData.schoolName =
        String(
          updateData.schoolName
        ).trim();
    }

    for (
      const [
        field,
        value,
      ] of Object.entries(
        updateData
      )
    ) {
      settings[field] = value;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message:
        "School settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Update school settings failed"
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid school settings data",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update school settings",
    });
  }
};


const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.user.userId,
      role: "admin",
    }).select("_id name email phone role");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const admin = await User.findOne({
      _id: req.user.userId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const emailExists = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: admin._id },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    admin.name = name.trim();
    admin.email = email.toLowerCase().trim();
    admin.phone = phone?.trim() || "";

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadSchoolLogo = async (
  req,
  res
) => {
  let newPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a logo image",
      });
    }

    const settings =
      await SchoolSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message:
          "School settings not found",
      });
    }

    const uploadResult =
      await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "school-management/logos",

                resource_type:
                  "image",
              },
              (
                error,
                result
              ) => {
                if (error) {
                  return reject(
                    error
                  );
                }

                resolve(result);
              }
            );

          uploadStream.end(
            req.file.buffer
          );
        }
      );

    newPublicId =
      uploadResult.public_id;

    const oldPublicId =
      settings.logoPublicId;

    settings.logo =
      uploadResult.secure_url;

    settings.logoPublicId =
      uploadResult.public_id;

    await settings.save();

    /*
      New logo successfully saved in DB.
      Now safely remove old Cloudinary logo.
    */
    if (
      oldPublicId &&
      oldPublicId !==
        uploadResult.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          oldPublicId,
          {
            resource_type:
              "image",
          }
        );
      } catch (error) {
        console.error(
          "Old school logo cleanup failed"
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "School logo uploaded successfully",
      data: settings,
    });
  } catch (error) {
    /*
      Cloudinary upload succeeded but
      database save failed:
      remove newly uploaded orphan.
    */
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(
          newPublicId,
          {
            resource_type:
              "image",
          }
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "New school logo cleanup failed"
        );
      }
    }

if (process.env.NODE_ENV !== "production") {
  console.error("School logo upload failed:", error.message);
}

return res.status(500).json({
  success: false,
  message:
    "Unable to upload school logo",
});
  }
};



module.exports = {
  getSchoolSettings,
  createSchoolSettings,
  updateSchoolSettings,
  updateAdminProfile,
  getAdminProfile,
  uploadSchoolLogo,
};