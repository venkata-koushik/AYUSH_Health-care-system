import Student from "../models/studentModel.js";

export const acceptRequest = async (model, id, studentId, data = {}) => {
  const request = await model.findOne({
    where: {
      id,
      studentId,
      status: "Pending",
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  request.status = "Accepted";
  request.acceptedAt = new Date();

  if (data.meetingLink) {
    request.meetingLink = data.meetingLink;
  }

  await request.save();
  return request;
};

export const rejectRequest = async (model, id, studentId) => {
  const request = await model.findOne({
    where: {
      id,
      studentId,
      status: "Pending",
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  request.status = "Rejected";
  await request.save();
  return request;
};

export const completeRequest = async (model, id, studentId, data) => {
  const request = await model.findOne({
    where: {
      id,
      studentId,
      status: "Accepted",
    },
  });

  if (!request) {
    throw new Error("Request not found or not in accepted status");
  }

  request.status = "Completed";
  request.completedAt = new Date();
  request.recommendedDoctor = data.recommendedDoctor || null;
  request.recommendationReason = data.recommendationReason || null;
  await request.save();

  const student = await Student.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  // Safely increment counters with fallbacks for null values
  student.patientsHelped = (student.patientsHelped || 0) + 1;

  if (model.name === "ChatRequest") {
    student.completedChats = (student.completedChats || 0) + 1;
  } else {
    student.completedVideoCalls = (student.completedVideoCalls || 0) + 1;
  }

  if (data.recommendedDoctor) {
    student.doctorReferrals = (student.doctorReferrals || 0) + 1;
  }

  await student.save();
  return request;
};
