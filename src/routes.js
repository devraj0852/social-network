const express = require('express')
const router = express.Router();

const UserController = require('./controller/user');

router.post('/user-register', UserController.userRegister);
router.post('/login', UserController.login);
router.get('/all-users/:id', UserController.getAllUsers);
router.post('/send-friend-request', UserController.sendFriendRequest);
router.post('/accept-friend-request', UserController.acceptFriendRequest);
router.get('/get-friends/:id', UserController.getFriendsList);
router.get('/get-user/:id', UserController.getUser);
router.get('/get-friend-request/:id', UserController.getFriendRequests);

router.get('/', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

router.get('/getFriendRequestList', (req, res) => {
    res.render('getFriendRequestList');
});

router.get('/accept-friend-request', (req, res) => {
    res.render('acceptFriendRequest');
});

router.get('/getFriendList', (req, res) => {
    res.render('getFriendList');
});


module.exports = router