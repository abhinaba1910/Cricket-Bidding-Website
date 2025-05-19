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
    enum: ['admin', 'user'],
    default: 'user',
  }
});

// Pre-save hook for password hashing and role logic
personSchema.pre('save', async function (next) {
  const person = this;

  // Hash password only if modified
  if (person.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    person.password = await bcrypt.hash(person.password, salt);
  }

  // Check if trying to assign admin role
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

// Export the model
const Person = mongoose.model('Person', personSchema);
module.exports = Person;
