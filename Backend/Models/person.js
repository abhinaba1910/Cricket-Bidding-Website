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
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },  
});


personSchema.pre('save', async function (next) {
  const person = this;

  try {
    // Hash password if new or modified
    if (person.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      person.password = await bcrypt.hash(person.password, salt);
    }

    // Check for admin uniqueness only on new documents or when role is modified
    if (person.isModified('role') && person.role === 'admin') {
      const existingAdmin = await mongoose.models.Person.findOne({ role: 'admin' });

      if (existingAdmin && existingAdmin._id.toString() !== person._id.toString()) {
        const error = new Error('An admin already exists. Only one admin is allowed.');
        error.name = 'AdminExistsError';
        return next(error);
      }
    }

    // Default role fallback
    if (!person.role) {
      person.role = 'user';
    }

    next();
  } catch (error) {
    next(error);
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
