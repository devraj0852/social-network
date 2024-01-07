const User = require('../model/user');
const bcrypt = require('bcrypt');
const FriendRequest = require('../model/friend.request');

const userRegister = async (req, res) => {
    try {
        const hashPwd = await bcrypt.hash(req.body.password, 10);

        const findUser = await User.findOne({ email: req.body.email });

        if (findUser) {
            res.json({
                success: false,
                message: `Email already registered`
            });
        } else {
            let newUser = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                mobile: req.body.mobile,
                email: req.body.email,
                password: hashPwd,
                address: req.body.address,
            });

            const resp = await newUser.save();

            res.json({
                success: true,
                message: `User registered successfully`,
                resp
            });
        }
    } catch (error) {
        console.error(error);

        res.json({
            success: false,
            message: `An error occurred`
        });
    }
};

const login = async (req, res) => {
    try {
        const findUser = await User.findOne({ email: req.body.email });

        if (findUser) {
            const checkPassword = await bcrypt.compare(req.body.password, findUser.password);

            if (checkPassword) {
                res.json({
                    success: true,
                    message: `User login successfully`,
                    user: findUser,
                });
            } else {
                res.json({
                    success: false,
                    message: `Invalid password`
                });
            }

        } else {
            res.json({
                success: false,
                message: `You have not registered`
            });
        }
    } catch (error) {
        console.error(error);

        res.json({
            success: false,
            message: `An error occurred`
        });
    }
};

const sendFriendRequest = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.body;

        const sender = await User.findById(sender_id);
        const receiver = await User.findById(receiver_id);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: sender_id,
            receiver: receiver_id,
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        const friendRequest = new FriendRequest({
            sender: sender_id,
            receiver: receiver_id,
        });

        await friendRequest.save();

        sender.friendRequestsSent.push(friendRequest._id);
        receiver.friendRequestsReceived.push(friendRequest._id);

        await sender.save();
        await receiver.save();

        res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const { request_id } = req.body;

        const friendRequest = await FriendRequest.findById(request_id);

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        const sender = await User.findById(friendRequest.sender);
        const receiver = await User.findById(friendRequest.receiver);

        sender.friends.push(receiver._id);
        receiver.friends.push(sender._id);

        await sender.save();
        await receiver.save();

        res.status(200).json({ message: 'Friend request accepted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getFriendsList = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).populate('friends', 'first_name last_name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friendsList = user.friends.map((friend) => ({
            _id: friend._id,
            first_name: friend.first_name,
            last_name: friend.last_name,
        }));

        res.status(200).json({ friends: friendsList, message: 'fetched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const authenticatedUserId = req.params.id;

        const user = await User.findById({ _id: authenticatedUserId });
        const ids = []
        for(let i = 0; i < user.friends.length; i++) {
            ids.push(user.friends[i]._id);
        }
        ids.push(authenticatedUserId)
        
        // const users = await User.find({ _id: { $ne: authenticatedUserId } });
        const users = await User.find({
            _id: { $nin: ids }
          });

        res.status(200).json({ users, message: 'Fetched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user, message: 'fetched successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate('friendRequestsReceived', 'sender status createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const arr = [];

        await Promise.all(user.friendRequestsReceived.map(async (request) => {
            if (request.status !== 'accepted') {
                const userData = await User.findById(request.sender);
                const obj = {
                    _id: userData._id,
                    request_id: request._id,
                    name: userData.first_name + ' ' + userData.last_name
                };
                arr.push(obj);
            }
        }));

        return res.status(200).json({
            friendRequestsReceived: arr,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    userRegister,
    login,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendsList,
    getUser,
    getFriendRequests,
    getAllUsers
}