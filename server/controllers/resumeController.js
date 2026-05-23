import imageKit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// controller for creating new resume
// POST: /api/users/resume
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    // create new resume
    const newResume = await Resume.create({
      userId,
      title,
    });

    return res.status(200).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for deleting a resume
// DELETE: /api/users/resume/:id
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const resumeId = req.params.resumeId;

    await Resume.findOneAndDelete({
      userId,
      _id: resumeId,
    });

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// get user resume by id
// GET: /api/users/resume/:id
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const resumeId = req.params.resumeId;

    const resume = await Resume.findOne({
      userId,
      _id: resumeId,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// get public resume by id
// GET: /api/resume/:id
export const getPublicResumeById = async (req, res) => {
  try {
    const resumeId = req.params.resumeId;

    const resume = await Resume.findOne({
      public: true,
      _id: resumeId,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// controller for updating a resume
// PUT: /api/users/resume/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy ;
    if(typeof resumeData ==='string'){
      resumeDataCopy=await JSON.parse(resumeData)
    }
    else{S
      resumeDataCopy=structuredClone(resumeData)
    }
    if (image) {
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imageKit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "/user-resumes/",
      });

      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    return res.status(200).json({
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};