const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema
const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'temp-admin', 'user'],
    default: 'user',
  },
  profilePic: {
    type: String, 
    default: '',  
  },
  firstTime: {
    type: Boolean,
    default: false, 
  },
});


// personSchema.pre('save', async function (next) {
//   const person = this;

//   if (person.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     person.password = await bcrypt.hash(person.password, salt);
//   }

//   if (person.role === 'admin') {
//     const adminExists = await mongoose.models.Person.findOne({ role: 'admin' });
  
//     if (adminExists) {
//       throw new Error('An admin already exists. Only one admin is allowed.');
//     }
//   } else if (!person.role) {
//     // Only set 'user' if role is not explicitly defined
//     person.role = 'user';
//   }  

//   next();
// });



personSchema.pre('save', async function (next) {
  const person = this;

  try {
    // 🔐 Only hash password if it's new or modified
    if (person.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      person.password = await bcrypt.hash(person.password, salt);
    }

    // ✅ Only enforce admin uniqueness if *trying* to create an admin
    if (person.role === 'admin') {
      const adminExists = await mongoose.models.Person.findOne({ role: 'admin' });

      if (adminExists) {
        const error = new Error('An admin already exists. Only one admin is allowed.');
        error.name = 'AdminExistsError';
        return next(error); // ❗ Correctly pass to next() for Express to catch
      }
    }

    // ✅ Default role fallback
    if (!person.role) {
      person.role = 'user';
    }

    next();
  } catch (error) {
    next(error); // Let Express error middleware handle it
  }
});


personSchema.methods.comparePassword=async function(candidatePassword){
  try {
    const isMatchPass=await bcrypt.compare(candidatePassword,this.password)
    return isMatchPass;
  } catch (error) {
    throw error;
  }
}

const Person = mongoose.model('Person', personSchema);
module.exports = Person;
