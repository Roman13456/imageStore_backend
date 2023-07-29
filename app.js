require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongoose').Types;
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const {getDb, connectToDb}=require('./db')
const mongoose = require('mongoose'); // Add this line
const http = require('http');
const socketIO = require('socket.io');


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  }
});


io.on('connection', (socket) => {//emitting sse event
  console.log('Client connected');

  // Handle the 'newComment' event from the client
  socket.on('newComment', (comment) => {
    console.log('New comment received:', comment);

    // You can do further processing or save the comment to your database here

    // Broadcast the new comment to all connected clients (including the sender)
    io.emit('newComment', comment);
  });

  // Handle other events and socket-related code as needed
});

// server.listen(3002, () => {
//   console.log(`Server is listening on port ${port}`);
// });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve static files from the "public" directory
// app.use(express.static('public'));


// Multer middleware to handle file uploads
const upload = multer({ dest: 'uploads/' });
let db;
connectToDb((err) => {
  if (!err) {
    server.listen(port, () => {
      console.log(`server listening on port ${port}`);
    });
    db = getDb(); // Use the Mongoose connection instead of the old db variable
  }
});

// Use the Comment model with Mongoose
const Comment = require('./commentModel');
// Handle POST requests to /upload
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  
  // Upload file to Cloudinary
  cloudinary.uploader.upload(file.path, (error, result) => {
    if (error) {
      console.error('Upload failed:', error);
      res.status(569).json({ error: 'Upload failed' });
    } else {
      console.log('Upload successful:', result);
      res.json(result);
    }
  });
});
app.delete('/delete/:publicId', (req, res) => {
    const publicId = req.params.publicId;
  
    // Delete image from Cloudinary
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Delete failed:', error);
        res.status(500).json({ error: 'Delete failed' });
      } else {
        console.log('Delete successful:', result);
        res.json(result);
      }
    });
  });






// app.use(express.json())



app.get('/', (req,res) => {
    res.json({msg:"welcome"})
})
app.get('/images', (req,res) => {
    let books = []
    const page = req.query.page || 0
    const imagesPerPage = req.query.limit || 9
    // console.log("queries:",page,imagesPerPage)
    //cursor toArray forEach
    db.collection('images')
    .find()
    .skip(page*imagesPerPage)
    .limit(parseInt(imagesPerPage))
    .forEach(book=>{
        books.push(book)})
    .then(()=>{
        res.status(200).json(books)
    })
    .catch(()=> {
        res.status(500).json({error: 'Could not fetch the documents'})
    })
    

})
app.get('/images/count', (req, res) => {
  db.collection('images')
    .countDocuments()
    .then((count) => {
      res.status(200).json({ count });
    })
    .catch(() => {
      res.status(500).json({ error: 'Could not fetch the document count' });
    });
});


app.get('/images/:id', (req,res) => {
    //cursor toArray forEach
    // console.log(req.params.id)
    if(ObjectId.isValid(req.params.id)){
        db.collection('images')
        .findOne({_id:new ObjectId(req.params.id)})
        .then((book)=>{
            res.status(200).json(book)
        })
        .catch(()=> {
            res.status(500).json({error: 'Could not fetch the document'})
        })
    }else{
        res.status(500).json({error: 'Not a valid doc id'})
    }
    
})

  
  
app.post('/images', (req,res) => {
    const book = req.body
    // console.log()
    //cursor toArray forEach
    db.collection('images')
      .insertOne(book)
      .then(result=>{
        res.status(201).json(result)
      })
      .catch(err=>{
        res.status(500).json({error: 'Could not create a new document'})
      })

})
app.delete('/images/:id', (req,res) => {
    //cursor toArray forEach
    if(ObjectId.isValid(req.params.id)){
        db.collection('images')
        .deleteOne({_id:new ObjectId(req.params.id)})
        .then((book)=>{
            res.status(200).json(book)
        })
        .catch(()=> {
            res.status(500).json({error: 'Could not delete the document'})
        })
    }else{
        res.status(500).json({error: 'Not a valid doc id'})
    }
    
})
// app.patch('/images/:id', (req,res) => {
//     if(ObjectId.isValid(req.params.id)){
//         const book = req.body
//         db.collection('images')
//         .updateOne({_id:new ObjectId(req.params.id)}, {$set:book})
//         .then((book)=>{
//             res.status(200).json({success:true, book})
//         })
//         .catch(()=> {
//             res.status(500).json({error: 'Could not update the document'})
//         })
//     }else{
//         res.status(500).json({error: 'Not a valid doc id'})
//     }
    
// })

app.patch('/images/:id', (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const book = req.body;
    db.collection('images')
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: book },
        { returnDocument: 'after' }// Return the updated document
      )
      .then((result) => {
        if (!result.value) {
          // Document with the provided id not found
          return res.status(404).json({ success: false, message: 'Document not found' });
        }
        console.log("book",book)
        console.log("result.value", result.value)
        // Return the updated book
        res.status(200).json({ success: true, data: result.value });
      })
      .catch(() => {
        res.status(500).json({ success: false, message: 'Could not update the document' });
      });
  } else {
    res.status(400).json({ success: false, message: 'Not a valid document id' });
  }
});



app.get('/backgrounds', (req,res) => {
    let backgrounds = []
    //cursor toArray forEach
    db.collection('backgrounds')
    .find()
    .forEach(e=>{
        backgrounds.push(e)})
    .then(()=>{
        res.status(200).json(backgrounds)
    })
    .catch(()=> {
        res.status(500).json({error: 'Could not fetch the backgrounds'})
    })
    
})
app.post('/backgrounds', (req,res) => {
    const background = req.body
    // console.log()
    //cursor toArray forEach
    db.collection('backgrounds')
      .insertOne(background)
      .then(result=>{
        res.status(201).json(result)
      })
      .catch(err=>{
        res.status(500).json({error: 'Could not create a new background'})
      })

})
app.delete('/backgrounds/:id', (req,res) => {
    //cursor toArray forEach
    if(ObjectId.isValid(req.params.id)){
        db.collection('backgrounds')
        .deleteOne({_id:new ObjectId(req.params.id)})
        .then((background)=>{
            res.status(200).json(background)
        })
        .catch(()=> {
            res.status(500).json({error: 'Could not delete the background'})
        })
    }else{
        res.status(500).json({error: 'Not a valid background id'})
    }
    
})


app.post("/login", (req, res) => {
  try {
    db.collection("users")
      .findOne({ email: req.body.email })
      .then((user) => {
        if (user && user.password === req.body.password) {
          res.status(201).json({obj:user, success: true, message: "Login successful" });
        } else if(user && user.password !== req.body.password) {
          res.status(401).json({success: false, message: "Invalid password" });
        }else{
          res.status(401).json({success: false, message: "Invalid email" });
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.post("/signup", (req, res) => {
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      nickname: req.body.email
    };
    console.log(newUser)

    db.collection("users")
      .findOne({ email: newUser.email })
      .then((existingUser) => {
        if (existingUser) {
          // User with the same email already exists
          res.status(409).json({ success: false, message: "User already exists" });
        } else {
          // Create a new user
          db.collection("users")
            .insertOne(newUser)
            .then(() => {
              res.status(201).json({ success: true, message: "User registered successfully" });
            })
            .catch((error) => {
              console.error("Error during signup:", error);
              res.status(500).json({ success: false, message: "Internal server error" });
            });
        }
      })
      .catch((error) => {
        console.error("Error during signup:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});





const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ...

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Generate reset token
    const resetToken = uuidv4();

    // Set expiration time (e.g., 1 hour from now)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);

    // Save reset token and expiration time in user document
    const user = await db.collection('users').findOneAndUpdate(
      { email },
      { $set: { resetToken, resetTokenExpiresAt: expirationTime } }
    );

    if (!user) {
      // User not found
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Construct password reset link with the reset token
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Send password reset email
    const msg = {
      to: email,
      from: 'romankhromishin@gmail.com',
      templateId: 'd-8289e436a8ac43c5bcf652cf12e82e9a', // Replace with your SendGrid template ID
      dynamicTemplateData: {
        PASSWORD_RESET_LINK: resetLink,
      },
    };

    await sgMail.send(msg);

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/validate-token', async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by the provided token
    const user = await db.collection('users').findOne({ resetToken: token });

    // Check if the user exists and the token is not expired
    if (!user || !user.resetTokenExpiresAt ) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }else if(new Date() > user.resetTokenExpiresAt){
      user.resetToken = undefined;
      user.resetTokenExpiresAt = undefined;
      await db.collection('users').updateOne({ _id: user._id }, { $set: user });
      return res.status(400).json({ success: false, message: 'Token is expired' });
    }

    // Token is valid and not expired
    res.status(200).json({ success: true, message: 'Token is valid' });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.patch('/change-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the user with the matching reset token
    const user = await db.collection('users').findOne({ resetToken: token });

    if (!user) {
      // Invalid or expired token
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (new Date() > user.resetTokenExpiresAt) {
      // Token has expired
      return res.status(400).json({ success: false, message: 'Token has expired' });
    }

    // Update the user's password
    // Replace this with your own password update logic, e.g., hashing the new password
    user.password = newPassword;

    // Remove the reset token and expiration time from the user object
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    // Save the updated user object
    await db.collection('users').updateOne({ _id: user._id }, { $set: user });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.post('/change-nickname', async (req, res) => {
  const { email, nickname } = req.body;

  try {
    // Check if the nickname is already taken
    const existingUserWithNickname = await db.collection('users').findOne({ nickname });

    if (existingUserWithNickname) {
      // Nickname is already taken
      return res.status(400).json({ success: false, message: 'Nickname is already taken' });
    }

    // Update the user's nickname
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { email },
      { $set: { nickname } },
      { returnOriginal: false } // Get the updated document instead of the original one
    );

    if (!updatedUser.value) {
      // User not found
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Construct password reset link with the reset token
    res.status(200).json({ success: true, message: 'Nickname is changed', user: updatedUser.value });
  } catch (error) {
    console.error('Error changing nickname:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// app.get('/users/:userId/nickname', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     if (!ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false, message: 'Invalid user ID' });
//     }

//     const user = await db.collection('users').findOne(
//       { _id: new ObjectId(userId) },
//       { projection: { nickname: 1 } }
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     res.status(200).json({ success: true, nickname: user.nickname });
//   } catch (error) {
//     console.error('Error retrieving user nickname:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });


app.post('/comments', async (req, res) => {
  try {
    // const { productId, nickname, commentText } = req.body;

    // Create a new comment using the Comment model
    const newComment = new Comment(req.body);

    // Save the new comment to the database
    const savedComment = await newComment.save();

    res.status(201).json({ success: true, message: 'Comment saved successfully', comment: savedComment });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ success: false, message: 'Failed to save comment' });
  }
});
app.get('/comments/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find all comments for the specified product and populate the 'nickname' field
    const comments = await Comment.find({ productId }).populate('nickname', '-_id nickname').populate('replies.nickname', '-_id nickname');;

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});


// POST endpoint to add a reply to a comment
app.post('/comments/:commentId/replies', async (req, res) => {
  try {
    const commentId = req.params.commentId;
    // const { userId, nickname, replyText } = req.body;

    // Create the reply object
    const reply = req.body

    // Find the comment to which the reply should be added
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Add the reply to the comment's replies array
    comment.replies.push(reply);

    // Save the updated comment to the database
    const savedReply = await comment.save();

    res.status(201).json({ success: true, message: 'Reply added successfully', reply:savedReply.replies[savedReply.replies.length-1] });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
});
app.delete('/comments/:commentId', async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Delete the comment from the database
    await comment.deleteOne();

    // Optionally, you can also delete all replies to this comment
    // await Comment.deleteMany({ _id: { $in: comment.replies } });

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
});


app.delete('/comments/:commentId/replies/:replyId', async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;

    // Find the comment that contains the reply
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    console.log(comment)
    // Find the index of the reply in the comment's replies array
    const replyIndex = comment.replies.findIndex((reply) => reply._id.toString() === replyId);

    if (replyIndex === -1) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Remove the reply from the replies array
    comment.replies.splice(replyIndex, 1);

    // Save the updated comment
    await comment.save();

    res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reply' });
  }
});






