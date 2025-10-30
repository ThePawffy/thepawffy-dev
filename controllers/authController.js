const { db } = require("../config/firebase");

exports.clerkLogin = async (req, res) => {
  try {
    const clerkUser = req.clerkUser;

    const userId = clerkUser.id;
    const phone = clerkUser.phone_numbers?.[0]?.phone_number || null;
    const email = clerkUser.email_addresses?.[0]?.email_address || null;

    // Save to Firestore
    await db.collection("users").doc(userId).set(
      {
        userId,
        phone,
        email,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.status(200).json({
      success: true,
      message: "User verified and stored successfully",
      data: { userId, phone, email },
    });
  } catch (err) {
    console.error("Firestore error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
