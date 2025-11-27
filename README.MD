# Berties Books

A Node.js web application for managing a bookshop built with Express.js, EJS templating, and MySQL database.

Features

1. Browse and search for books
2. User registration system
3. Dynamic book listing from database
4. Responsive page templates with EJS
5. Modular routing structure

## Access Control

### Protected Routes (Login Required)
- `/users/list` - Only logged-in users can view the list of registered users
- `/users/logout` - Only logged-in users can logout
- `/books/list` - Only logged-in users can view the complete book inventory

These routes are protected using the `redirectLogin` middleware, which checks for `req.session.userId`. If a user is not logged in, they are redirected to the login page.

### Public Routes (No Login Required)
- `/` - Home page: accessible to all visitors
- `/about` - About page: public information about the shop
- `/books/search` - Search page: allows anyone to search for books
- `/books/search-result` - Search results: displays search results to anyone
- `/users/register` - Registration: allows new users to sign up
- `/users/login` - Login: allows users to authenticate

### Rationale
Public routes are designed to encourage visitor engagement and allow potential customers to browse and register. Protected routes contain sensitive information (user list) or functionality that only makes sense for authenticated users (viewing full inventory, logout).

## Form Validation

The application implements server-side validation using the `express-validator` module to ensure data integrity and security.

### Registration Form Validation

The following validation rules are applied to the registration form (`/users/registered` route):

1. **Email**: Must be a valid email address format
2. **Username**: 
   - Must be between 5 and 20 characters long
   - Must contain only alphanumeric characters (letters and numbers)
3. **Password**: 
   - Must be at least 8 characters long
4. **First Name**: 
   - Cannot be empty
   - Must contain only alphabetic characters
5. **Last Name**: 
   - Cannot be empty
   - Must contain only alphabetic characters

### How It Works

- Validation is performed on the server side before any data is saved to the database
- If validation fails, the user is redirected back to the registration page
- If validation passes, the user's information is securely stored with a hashed password
- All validation rules use the `express-validator` module's built-in functions such as `isEmail()`, `isLength()`, `isAlphanumeric()`, `notEmpty()`, and `isAlpha()`

### Security Benefits

- Prevents injection of invalid or malicious data
- Ensures usernames follow a consistent format
- Enforces minimum password length for better security
- Validates email addresses to ensure proper format
- Sanitizes user input before database insertion

## Form Validation Implementation

### Where Validation Has Been Applied

#### 1. User Registration (`/users/registered`)
**Validation Rules:**
- Email: Valid email format required
- Username: 5-20 characters, alphanumeric only
- Password: Minimum 8 characters
- First Name: Required, alphabetic characters only
- Last Name: Required, alphabetic characters only

**Reasoning:** Registration is the entry point for user data into the database. Strict validation prevents:
- Invalid email addresses that can't receive communications
- Weak passwords that compromise security
- Malformed usernames that could cause display or database issues
- Empty or invalid name fields that reduce data quality

#### 2. User Login (`/users/loggedin`)
**Validation Rules:**
- Username: Cannot be empty
- Password: Cannot be empty

**Reasoning:** Basic validation to ensure both fields are provided before querying the database. This prevents unnecessary database lookups and provides immediate feedback to users who accidentally submit empty forms.

#### 3. Book Search (`/books/search-result`)
**Validation Rules:**
- Search text: Cannot be empty, must be 1-100 characters, trimmed of whitespace

**Reasoning:** Prevents empty searches that would return all results or cause database errors. The maximum length prevents extremely long queries that could impact performance. Trimming whitespace improves search quality.

### Where Validation Has NOT Been Applied

#### 1. Static Pages (`/`, `/about`)
**Reasoning:** These pages don't accept user input, so validation is not applicable.

#### 2. GET Routes (List Pages)
**Reasoning:** Routes like `/users/list` and `/books/list` only display data and don't accept user input. These are protected by authentication middleware instead.

#### 3. Logout Route (`/users/logout`)
**Reasoning:** This route performs a simple session destruction and doesn't process any user input that requires validation.

#### 4. Search Form Page (`/books/search`)
**Reasoning:** This is just a display page with a form. Validation occurs on the POST/GET endpoint that processes the form submission, not on the page that displays the form.

### Validation Strategy

The application follows these principles:
- **Server-side validation is mandatory** - Never trust client-side validation alone
- **Validate at the point of data processing** - Check input when it's submitted, not when forms are displayed
- **Fail securely** - Invalid input redirects users back to the form rather than processing bad data
- **Use appropriate validators** - Each field type has specific validation rules (email format, length constraints, character types)
- **Protect the database** - All user input is validated before any database queries to prevent SQL injection and data corruption

### Future Improvements
- Display specific error messages to users explaining what needs to be corrected
- Add client-side validation for better user experience (in addition to server-side)
- Implement rate limiting on login attempts to prevent brute force attacks
- Add CSRF token validation for additional security

To install and run:

npm install
node index.js
