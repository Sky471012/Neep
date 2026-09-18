const OtpLog = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { getDBConnection } = require("../config/dbManager");
const branchList = [
  "realDataBase",
  "realDataBaseOne",
  "realDataBaseTwo",
  "userDataBase",
];
const { sendMail } = require("../utils/sendMail");
const {
  setAuthCookie,
  clearAuthCookie,
} = require("../config/authCookie");

const jwtOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || "8h",
};

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
        process.env.JWT_SECRET,
        jwtOptions
      );
      setAuthCookie(res, token);

      return res.json({
        success: true,
        branch,
        branches: matches.map(({ branch }) => ({
          key: branch,
          name: branch, // or display name if available
        })),
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
          guardianPhone: student.guardianPhone,
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
      process.env.JWT_SECRET,
      jwtOptions
    );
    setAuthCookie(res, token);

    res.json({
      success: true,
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
        guardianPhone: student.guardianPhone || "N/A",
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
      // ensure model is unique per connection
      const Otp = db.models.OtpLog || db.model("OtpLog", OtpLog.schema);
      await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      console.log(`✅ OTP stored in branch ${branch}`);
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
    // ✅ If branch provided → finalize login for that specific branch
    if (chosenBranch) {
      console.log("Finalizing login for:", chosenBranch);

      // ✅ Step 1: Identify all branches where the user exists (for multi-branch display)
      const userBranches = [];
      for (const branch of branchList) {
        const db = await getDBConnection(branch);
        const AdminTeacher = db.model(
          "AdminTeacher",
          require("../models/Admins_teachers").schema
        );
        const exists = await AdminTeacher.findOne({ email });
        if (exists) userBranches.push(branch);
      }

      // ✅ Step 2: Proceed with chosen branch OTP validation
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

      if (!validOtp) {
        console.log(`OTP not found in branch ${chosenBranch}`);
        return res
          .status(400)
          .json({ message: "Invalid or expired OTP in chosen branch" });
      }

      const user = await AdminTeacher.findOne({ email });
      if (!user) {
        console.log(`User not found in branch ${chosenBranch}`);
        return res
          .status(404)
          .json({ message: "User not found in chosen branch" });
      }

      // ✅ Issue JWT
      const token = jwt.sign(
        { id: user._id, role: user.role, branch: chosenBranch },
        process.env.JWT_SECRET,
        jwtOptions
      );
      setAuthCookie(res, token);

      // ✅ Delete OTPs *after* successful login
      await Otp.deleteMany({ email });

      // ✅ Send only branches user actually belongs to
      return res.json({
        success: true,
        branch: chosenBranch,
        branches: userBranches, // ✅ send only user's branches
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

    // ✅ Phase A: no branch provided → identify valid branches
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

    // ✅ Multiple branch case — don't delete OTPs yet
    if (validBranches.length > 1) {
      console.log(
        "Multiple branches found:",
        validBranches.map((b) => b.branch)
      );
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
        },
        message: "OTP verified. Choose which branch to enter.",
      });
    }

    // ✅ Single branch
    const { branch, user } = validBranches[0];
    const token = jwt.sign(
      { id: user._id, role: user.role, branch },
      process.env.JWT_SECRET,
      jwtOptions
    );
    setAuthCookie(res, token);

    // ✅ Delete OTPs only now
    const db = await getDBConnection(branch);
    const Otp = db.model("OtpLog", OtpLog.schema);
    await Otp.deleteMany({ email });

    return res.json({
      success: true,
      branch,
      user,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.switchBranch = async (req, res) => {
  const { branch } = req.body;
  const user = req.user; // decoded from current JWT

  try {
    // ✅ Get correct DB for the chosen branch
    const db = await getDBConnection(branch);

    let idForBranch = null;

    if (user.role === "student") {
      // Get the current DB (from JWT's branch) to fetch student info
      const currentDb = await getDBConnection(user.branch);
      const CurrentStudent = currentDb.model(
        "Student",
        require("../models/Student").schema
      );
      const currentStudent = await CurrentStudent.findById(user.id);

      if (!currentStudent) {
        return res.status(404).json({
          success: false,
          message: `Current student not found in branch ${user.branch}`,
        });
      }

      // Now connect to target branch
      const db = await getDBConnection(branch);
      const Student = db.model("Student", require("../models/Student").schema);

      // Match by phone + dob in target branch
      const existingStudent = await Student.findOne({
        phone: currentStudent.phone,
        dob: currentStudent.dob,
      });

      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          message: `Student not found in branch ${branch}`,
        });
      }

      idForBranch = existingStudent._id;
    } else {
      // ✅ Step 1: Get the current DB connection (from token)
      const currentDb = await getDBConnection(user.branch);
      const CurrentAdminTeacher = currentDb.model(
        "AdminTeacher",
        require("../models/Admins_teachers").schema
      );

      // ✅ Step 2: Fetch the current user to get unique fields (email)
      const currentUser = await CurrentAdminTeacher.findById(user.id);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: `Current ${user.role} not found in branch ${user.branch}`,
        });
      }

      // ✅ Step 3: Connect to the new target branch
      const db = await getDBConnection(branch);
      const AdminTeacher = db.model(
        "AdminTeacher",
        require("../models/Admins_teachers").schema
      );

      // ✅ Step 4: Match the same person by email (since that's unique across branches)
      const existingUser = await AdminTeacher.findOne({
        email: currentUser.email,
      });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: `${user.role} not found in branch ${branch}`,
        });
      }

      // ✅ Step 5: Update ID to the correct one from the new branch
      idForBranch = existingUser._id;
    }

    // ✅ Issue a new token with branch-specific id
    const newToken = jwt.sign(
      { id: idForBranch, role: user.role, branch },
      process.env.JWT_SECRET,
      jwtOptions
    );
    setAuthCookie(res, newToken);

    return res.json({
      success: true,
      branch,
    });
  } catch (err) {
    console.error("Switch branch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSession = (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
};
