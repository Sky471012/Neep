const OtpLog = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { getDBConnection } = require("../config/dbManager");
const branchList = ["realDataBase", "userDataBase"];
const { sendMail } = require("../utils/sendMail");

// Login Student
exports.loginStudent = async (req, res) => {
  const { phone, dob, selectedBranch } = req.body;
  const matches = [];

  try {
    // Step 1: check all branches
    for (const branch of branchList) {
      const db = await getDBConnection(branch);
      const Student = db.model("Student", require("../models/Student").schema);
      const student = await Student.findOne({ phone, dob });
      if (student) matches.push({ branch, student });
    }

    if (matches.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 2: branch chosen by user
    if (selectedBranch) {
      const match = matches.find((m) => m.branch === selectedBranch);
      if (!match) return res.status(400).json({ message: "Invalid branch" });

      const { branch, student } = match;
      const token = jwt.sign(
        { id: student._id, role: "student", branch },
        process.env.JWT_SECRET
      );

      return res.json({
        success: true,
        authToken: token,
        branch,
        student: {
          id: student._id,
          name: student.name,
          phone: student.phone,
          dob: student.dob,
          address: student.address,
          class: student.class,
          fee: student.fee,
          dateOfJoining: student.dateOfJoining,
          guardianName: student.guardianName,
          schoolType: student.schoolType,
        },
      });
    }

    // Step 3: multiple branches → let frontend select
    if (matches.length > 1) {
      return res.json({
        success: true,
        multipleBranches: true,
        branches: matches.map(({ branch }) => ({
          key: branch,
          name: branch, // or display name if available
        })),
        message: "Select branch to continue",
      });
    }

    // Step 4: only one branch found → login directly
    const { branch, student } = matches[0];
    const token = jwt.sign(
      { id: student._id, role: "student", branch },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      authToken: token,
      branch,
      student: {
        id: student._id,
        name: student.name,
        phone: student.phone,
        dob: student.dob,
        address: student.address,
        class: student.class,
        fee: student.fee,
        dateOfJoining: student.dateOfJoining,
        guardianName: student.guardianName || "N/A",
        schoolType: student.schoolType || "N/A",
      },
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Send OTP (Admin/Teacher)
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const matches = [];

  try {
    for (const branch of branchList) {
      const db = await getDBConnection(branch);
      const AdminTeacher = db.model(
        "AdminTeacher",
        require("../models/Admins_teachers").schema
      );
      const user = await AdminTeacher.findOne({ email });
      if (user) matches.push({ branch, user });
    }

    if (matches.length === 0)
      return res.status(404).json({ message: "User not found" });

    // Generate one OTP for all branches (same user)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    for (const { branch } of matches) {
      const db = await getDBConnection(branch);
      const Otp = db.model("OtpLog", OtpLog.schema);
      await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    }

    await sendMail(
      email,
      "New Era Education Point (NEEP) – One-Time Password (OTP)",
      `Dear User,

Your One-Time Password (OTP) is: ${otp}

This OTP will expire in 60 minutes. Please use it to complete your verification.

If you did not request this code, please ignore this email.

Best regards,
New Era Education Point (NEEP)`,
      process.env.EMAIL_USER_OTP
    );

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Verify OTP (Admin/Teacher)
exports.verifyOtp = async (req, res) => {
  const { email, otp, branch: chosenBranch } = req.body;

  try {
    // If branch provided → finalize login for that specific branch
    if (chosenBranch) {
      const db = await getDBConnection(chosenBranch);
      const Otp = db.model("OtpLog", OtpLog.schema);
      const AdminTeacher = db.model(
        "AdminTeacher",
        require("../models/Admins_teachers").schema
      );

      const validOtp = await Otp.findOne({
        email,
        otp,
        expiresAt: { $gt: new Date() },
      });

      if (!validOtp)
        return res
          .status(400)
          .json({ message: "Invalid or expired OTP in chosen branch" });

      const user = await AdminTeacher.findOne({ email });
      if (!user)
        return res
          .status(404)
          .json({ message: "User not found in chosen branch" });

      // Issue token
      const token = jwt.sign(
        { id: user._id, role: user.role, branch: chosenBranch },
        process.env.JWT_SECRET
      );

      // Delete OTP entries for this email
      await Otp.deleteMany({ email });

      return res.json({
        success: true,
        authToken: token,
        branch: chosenBranch,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          dob: user.dob || "N/A",
          address: user.address || "N/A",
          qualification: user.qualification || "N/A",
          aadhar: user.aadhar || "N/A",
          experience: user.experience || 0,
        },
      });
    }

    // Phase A: no branch provided, check all branches
    const validBranches = [];
    let foundUser = null;

    for (const branch of branchList) {
      const db = await getDBConnection(branch);
      const Otp = db.model("OtpLog", OtpLog.schema);
      const AdminTeacher = db.model(
        "AdminTeacher",
        require("../models/Admins_teachers").schema
      );

      const validOtp = await Otp.findOne({
        email,
        otp,
        expiresAt: { $gt: new Date() },
      });

      if (validOtp) {
        const user = await AdminTeacher.findOne({ email });
        if (user) {
          validBranches.push({ branch, user });
          foundUser = user;
        }
      }
    }

    if (validBranches.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // If OTP verified in multiple branches
    if (validBranches.length > 1) {
      return res.json({
        success: true,
        multipleBranches: true,
        branches: validBranches.map(({ branch }) => branch),
        user: {
          id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          phone: foundUser.phone,
          role: foundUser.role,
          dob: foundUser.dob || "N/A",
          address: foundUser.address || "N/A",
          qualification: foundUser.qualification || "N/A",
          aadhar: foundUser.aadhar || "N/A",
          experience: foundUser.experience || 0,
        },
        message: "OTP verified. Choose which branch to enter.",
      });
    }

    // If found in only one branch
    const { branch, user } = validBranches[0];
    const token = jwt.sign(
      { id: user._id, role: user.role, branch },
      process.env.JWT_SECRET
    );

    // Clean up OTP
    const db = await getDBConnection(branch);
    const Otp = db.model("OtpLog", OtpLog.schema);
    await Otp.deleteMany({ email });

    return res.json({
      success: true,
      authToken: token,
      branch,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dob: user.dob || "N/A",
        address: user.address || "N/A",
        qualification: user.qualification || "N/A",
        aadhar: user.aadhar || "N/A",
        experience: user.experience || 0,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
