require("dotenv").config();
require("../config/dns");

const connectDB = require("../config/db");
const User = require("../models/User");

async function upsertDemo({ name, email, password, role }) {
  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    await User.create({
      name,
      email,
      password,
      role,
      active: true
    });

    console.log(`Created demo ${role}: ${email}`);
    return;
  }

  user.name = name;
  user.role = role;
  user.active = true;
  user.password = password;

  await user.save();

  console.log(`Updated demo ${role}: ${email}`);
}

(async () => {
  await connectDB();

  await upsertDemo({
    name: "Demo Student",
    email:
      process.env.DEMO_STUDENT_EMAIL ||
      "student@studybuddy.demo",
    password:
      process.env.DEMO_STUDENT_PASSWORD ||
      "Student@123",
    role: "student"
  });

  await upsertDemo({
    name: "Demo Admin",
    email:
      process.env.DEMO_ADMIN_EMAIL ||
      "admin@studybuddy.demo",
    password:
      process.env.DEMO_ADMIN_PASSWORD ||
      "Admin@123",
    role: "admin"
  });

  console.log("Demo users seed completed successfully.");
  process.exit(0);
})().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});