const express = require("express");
const path = require("path");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const firebase = require('../../firebase');

router.get("/:id", (req, res) => {
    const user = req.session.user;
    const uid = req.params.id;
    const {firstName, lastName, studentNumber, contactNumber, email, role} = req.body;
    if (typeof user == "undefined" || user.role != "Admin") {
        try {
            res.redirect("/login");
        } catch (error) {
            
        }
    }

    const collectionRef = db.collection('users');
    collectionRef.doc(uid).get().then(doc => {
        const userDoc = doc.data();
        res.render('admin/editUser', {id: doc.id, ...userDoc} );
    });
})

router.post("/update/", (req, res) => {
    const user = req.session.user;
    const uid = req.body.id;
    const {firstName, lastName, studentNumber, contactNumber, email, role} = req.body;
    if (typeof user == "undefined" || user.role != "Admin") {
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
        contactNumber,
        role,
    });

    admin.auth().updateUser(uid, {
        email: email
    });
    res.redirect(`/edit-user/${uid}?status=success`);
});

module.exports = router;