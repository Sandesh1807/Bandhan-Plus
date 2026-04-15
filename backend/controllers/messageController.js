const Message = require('../models/Message');
const Profile = require('../models/Profile');

// @route  POST /api/messages/send/:profileId
// @access Private
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.profileId;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const senderProfile = await Profile.findOne({ user: req.user._id });
    const receiverProfile = await Profile.findById(receiverId);

    if (!senderProfile || !receiverProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Verify they are mutually matched
    if (!senderProfile.matches.includes(receiverProfile._id)) {
      return res.status(403).json({ message: 'You can only message mutually matched profiles.' });
    }

    // Enforce 10 free chats limit
    if (!senderProfile.isPremium && senderProfile.freeMessagesSent >= 10) {
      return res.status(403).json({ message: 'Free message limit reached. Upgrade to Premium to continue chatting!' });
    }

    // Create the message
    const newMessage = new Message({
      sender: senderProfile._id,
      receiver: receiverProfile._id,
      text: text.trim()
    });
    
    await newMessage.save();

    // Increment sender's free limit if they aren't premium
    if (!senderProfile.isPremium) {
      senderProfile.freeMessagesSent += 1;
      await senderProfile.save();
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @route  GET /api/messages/history/:profileId
// @access Private
const getChatHistory = async (req, res) => {
  try {
    const receiverId = req.params.profileId;
    const senderProfile = await Profile.findOne({ user: req.user._id });

    if (!senderProfile) {
      return res.status(404).json({ message: 'Your profile not found' });
    }

    // Find all messages where sender and receiver are these two profiles (either direction)
    const messages = await Message.find({
      $or: [
        { sender: senderProfile._id, receiver: receiverId },
        { sender: receiverId, receiver: senderProfile._id }
      ]
    }).sort({ createdAt: 1 }); // Chronological order

    res.json({
      messages,
      freeMessagesSent: senderProfile.freeMessagesSent,
      isPremium: senderProfile.isPremium,
      matches: senderProfile.matches.includes(receiverId)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
};

module.exports = { sendMessage, getChatHistory };
