const express = require("express");
const path = require("path");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const firebase = require('../firebase');

router.get("/", (req, res) => {
    const user = req.session.user;
    const {firstName, lastName, studentNumber, contactNumber, email, role} = req.body;
    if (typeof user == "undefined" || user.role != "User") {
        try {
            res.redirect("/login");
        } catch (error) {
            
        }
    }

    const collectionRef = db.collection('users');
    collectionRef.where("email", "==", (typeof user != "undefined" ? user.email : "")).get().then(doc => {
        const userDoc = [];
        doc.forEach(data => {
            userDoc.push(data.data())
            userDoc[0].id = data.id
            userDoc[0].user = user
        })
        console.log(userDoc)
        res.render('editProfile', userDoc[0] );
    });
})

router.post("/update/", (req, res) => {
    const user = req.session.user;
    const uid = req.body.id;
    const {firstName, lastName, studentNumber, contactNumber, email, role} = req.body;
    if (typeof user == "undefined" || user.role != "User") {
        try {
            res.redirect("/login");
        } catch (error) {
            
        }
    }
    const collectionRef = db.collection('users');
    collectionRef.doc(uid).update({
        firstName,
        lastName,
        studentNumber,
        email,
        contactNumber
    });

    admin.auth().updateUser(uid, {
        email: email
    });
    res.redirect(`/edit-profile?status=success`);
});

module.exports = router;