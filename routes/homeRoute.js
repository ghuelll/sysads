const express = require("express");
const path = require("path");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

router.get("/", async (req, res) => {
    const user = req.session.user;
    if (typeof user == "undefined" || user.role != "User") {
        try {
            res.redirect("/login");
        } catch (error) {
            
        }
    }

    const notificationRef = db.collection('announcement').orderBy("date", "desc");
    const lostRef = db.collection('lost');
    const data = [];
    const notification = [];
    const viewed = [];
    await lostRef.get()
    .then((snapshot) => {
        db.collection('found').get().then((found) => {
            
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            found.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            data.sort((a, b) => {
                let da = new Date(a.dataAdded.toDate()),
                    db = new Date(b.dataAdded.toDate());
                return db - da;
            });
            
            notificationRef.get().then((notif) => {
                notif.forEach((doc) => {
                    // console.log(doc);
                    var message = doc.data().thoughts;
                    var subject = doc.data().subject;
                    var image = doc.data().image;
                    
                    notification.push({ id: doc.id, message: message, ...doc.data() });
                });
            });
            notificationRef.get().then((notif) => {
                notif.forEach((doc) => {
                    // console.log(doc);
                    var notifs = doc.data();
                    if (typeof notifs.viewedBy == "undefined" || (typeof user != "undefined" && !notifs.viewedBy.includes(user.name))) {
                        viewed.push(doc.id);
                        db.collection('announcement').doc(doc.id).update({ viewedBy: (typeof user != "undefined" ? [user.name, ...notifs.viewedBy] : [user.name]) });
                    }
                });

                db.collection('appointment').where("email", "==", (typeof user != "undefined" ? user.email : "")).get().then((appoint) => {
                    var viewedAppointment = [];
                    appoint.forEach((doc) => {
                        viewedAppointment.push({id: doc.id, ...doc.data()});
                        if (typeof viewedAppointment.viewed == "undefined" || (typeof viewedAppointment.viewed != "undefined" && !viewedAppointment.viewed)) {
                            db.collection('appointment').doc(`${doc.id}`).update({ viewed: true });
                        }
                    });
                    const ed = new Date("2016-08-21T00:00:00.000Z").getTime()
                    const sd = new Date("2010-08-21T00:00:00.000Z").getTime()
                    const notifJoined = notification.concat(viewedAppointment).filter(data =>{
                        return typeof data.date != "string"
                    }).sort((a, b) => {
                        return (new Date(b.date.toMillis()).getTime() - new Date(a.date.toMillis()).getTime());
                    });
                    res.render('home', { user: user, data: data, notification: notification, viewed: viewed, appointment: viewedAppointment, notifJoined: notifJoined }, );
                })
            });
        })
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });

});
module.exports = router;
