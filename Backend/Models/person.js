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
  }
});


personSchema.pre('save', async function (next) {
  const person = this;

  if (person.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    person.password = await bcrypt.hash(person.password, salt);
  }

  if (person.role === 'admin') {
    const adminExists = await mongoose.models.Person.findOne({ role: 'admin' });

    if (adminExists) {
      throw new Error('An admin already exists. Only one admin is allowed.');
    }
  } else {
    // Automatically assign 'user' role if not explicitly set
    person.role = 'user';
  }

  next();
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
