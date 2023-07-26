require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const { ObjectId } = require("mongodb");
const {connectToDb, getDb} = require('./db')

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors'); // Add this line

const app = express();
const port = 3001;


// Cloudinary configuration
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Serve static files from the "public" directory
// app.use(express.static('public'));
app.use(cors()); // Use cors middleware
app.use(express.json())

// Multer middleware to handle file uploads
const upload = multer({ dest: 'uploads/' });
let db
connectToDb((err)=>{
    if(!err){
        app.listen(port, ()=>{
            console.log(`app listening on port ${port}`)
        })
        db = getDb()
    }
})
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





