# 🏥 AI-Enabled Healthcare Management System

> A full-stack AI-powered healthcare platform that digitally connects **Patients**, **Final-Year Medical Students**, **Licensed Doctors**, and **Government Health Authorities** through secure telemedicine, AI-assisted Electronic Health Records (EHR), QR-based consultation workflows, and real-time healthcare analytics.

---

## 📖 Overview

Healthcare services often involve multiple stakeholders working together to deliver quality patient care. This platform is designed to digitally streamline that workflow by integrating modern web technologies with Artificial Intelligence to improve consultation efficiency, documentation, and healthcare management.

The system enables:

- 👨‍⚕️ **Licensed Doctors** to conduct consultations, manage patient records, and generate AI-assisted clinical documentation.
- 🎓 **Final-Year MBBS Students** to participate in supervised clinical workflows, interact with patients, and gain practical exposure through digital consultation modules.
- 🧑‍🤝‍🧑 **Patients** to register, maintain digital medical records, communicate with healthcare professionals, and attend real-time video consultations.
- 🏛️ **Government Health Authorities** to access anonymized healthcare analytics, AI-generated insights, and population-level statistics for informed decision-making.

Rather than functioning as a traditional Hospital Management System, this project demonstrates how Artificial Intelligence and modern web technologies can be integrated into healthcare workflows to create an intelligent, collaborative, and scalable digital healthcare ecosystem.

---

# ✨ Project Highlights

- 🤖 AI-Assisted Electronic Health Record (EHR) Generation
- 🩺 Multi-role Healthcare Platform
- 📹 Real-Time Video Consultation
- 💬 Instant Messaging Between Users
- 📱 QR-Based Patient Consultation Workflow
- 📄 Digital Medical History Management
- 📊 Government Healthcare Analytics Dashboard
- 🧠 AI-Powered Clinical Insights
- 🔐 JWT-Based Secure Authentication
- ☁️ Cloud Deployment Ready

---

# 🤖 AI Features

Artificial Intelligence is one of the core components of this platform.

Instead of simply storing patient information, the system assists healthcare professionals by generating structured clinical documentation and providing intelligent healthcare insights.

### AI Assisted EHR Generation

During consultation, doctors can generate an AI-assisted draft Electronic Health Record based on the patient's consultation details.

The generated draft includes:

- Patient Summary
- Clinical Findings
- Possible Assessment
- Suggested Clinical Notes
- Structured Medical Documentation

Doctors remain in complete control and can review, modify, or approve the generated draft before saving it into the patient's medical history.

---

### 🧠 AI Healthcare Insights

The Government Dashboard includes an **AI Insights** module that transforms healthcare statistics into easy-to-understand summaries.

Instead of manually interpreting multiple charts and datasets, administrators receive concise AI-generated observations about:

- Consultation trends
- Patient distribution
- Healthcare utilization
- System activity
- Operational statistics

This enables quicker understanding of overall healthcare patterns.

---

### ⚡ AI-Assisted Clinical Workflow

Artificial Intelligence supports healthcare professionals by reducing repetitive documentation tasks while allowing doctors to focus more on patient care.

The AI acts as an intelligent clinical assistant rather than replacing medical decision-making.

---

# 🌟 Key Features

### 👨‍⚕️ Doctor Portal

- Secure Doctor Authentication
- Patient Search
- QR Code Consultation Workflow
- Patient History
- AI Draft EHR Generation
- Consultation Management
- Video Consultation
- Real-Time Chat

---

### 🎓 Student Portal

- Student Registration & Login
- Patient Interaction
- Clinical Dashboard
- Real-Time Chat
- Video Consultation
- Learning-Oriented Consultation Workflow

---

### 🧑 Patient Portal

- Patient Registration
- Digital Health Profile
- Medical History
- Appointment & Consultation Access
- Video Consultation
- Chat with Healthcare Professionals
- Secure Record Management

---

### 🏛️ Government Dashboard

- Government Authentication
- Healthcare Analytics
- AI Insight Dashboard
- Patient Statistics
- Doctor Statistics
- Consultation Analytics
- System Usage Overview
- Population-Level Healthcare Visualization

---

# 👥 User Roles

| Role | Description |
|-------|-------------|
| 🧑 Patient | Register, manage health records, communicate with healthcare professionals, and participate in online consultations. |
| 🎓 Medical Student | Assist in supervised clinical workflows, interact with patients, and gain practical healthcare experience. |
| 👨‍⚕️ Licensed Doctor | Conduct consultations, generate AI-assisted EHRs, review patient history, and provide treatment recommendations. |
| 🏛️ Government Authority | Access anonymized healthcare analytics, AI-generated insights, and system-wide healthcare statistics. |

---

# 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React.js, Vite |
| Backend | Express.js, Node.js |
| Database | PostgreSQL, Sequelize ORM |
| Authentication | JWT |
| Artificial Intelligence | Groq API |
| Real-Time Communication | Socket.IO |
| Video Consultation | WebRTC |
| Styling | CSS3 |
| Deployment | Vercel, Render, Neon PostgreSQL |

---

# 🏗️ System Architecture

```text
                        ┌──────────────────────────┐
                        │        Patients          │
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │     Student Portal       │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │     Doctor Portal        │
                        │  AI Assisted EHR System  │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │     Express.js REST API        │
                     └────────────┬───────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
         PostgreSQL          Groq AI API       Socket.IO
            Database          AI Services      + WebRTC
                │
                ▼
     Government Analytics Dashboard
             + AI Insights
```

---

## 🎯 Why This Project?

Unlike traditional healthcare management systems, this platform demonstrates how **Artificial Intelligence**, **real-time communication**, **digital clinical workflows**, and **healthcare analytics** can work together in a single integrated ecosystem.

It showcases practical implementations of:

- AI-assisted healthcare documentation
- Secure multi-role authentication
- Real-time telemedicine
- QR-based consultation workflows
- Government healthcare analytics
- Cloud-based full-stack deployment
- Modern healthcare application architecture

---

# 🚀 Getting Started

Follow the steps below to explore and test the complete healthcare platform.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/venkata-koushik/AYUSH_Health-care-system.git
cd AYUSH_Health-care-system
```

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

### 3️⃣ Configure Environment Variables

Create the required `.env` files for both the client and server with your respective configuration.

### 4️⃣ Start the Application

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm run dev
```

The application will be available at:

```
Frontend : http://localhost:5173
Backend  : http://localhost:5001
```

---

# 🧪 Testing the Platform

The platform has been designed to simulate a real-world healthcare ecosystem involving Patients, Medical Students, Doctors, and Government Authorities.

For the best experience, it is recommended to explore each role separately and then test the interactions between them.

---

# 🔑 Demo Login Credentials

## 👨‍⚕️ Doctor Account

Use the following pre-registered doctor account to experience the complete doctor workflow.

| Email | Password |
|--------|----------|
| **sharma@gmail.com** | **12345678** |

### Doctor Features

- Doctor Dashboard
- QR Patient Consultation
- AI Draft EHR Generation
- Patient History
- Video Consultation
- Real-Time Chat
- Consultation Management

> **Note:** New doctor registration requires a valid Government Medical License ID.

---

## 🎓 Student Account

You may either create a new student account or use the existing demo account.

| Email | Password |
|--------|----------|
| **koushik@gmail.com** | **12345678** |

### Student Features

- Student Dashboard
- Patient Interaction
- Video Consultation
- Real-Time Chat
- Clinical Learning Workflow

---

## 🧑 Patient Account

Patients are encouraged to register their own account to experience the complete workflow.

You may register using:

- Any Email Address
- Any Valid Name
- Password of your choice

For the best testing experience, create your own patient account and use it throughout the platform.

### Patient Features

- Personal Dashboard
- Medical History
- Video Consultation
- Chat with Healthcare Professionals
- Digital Health Records

---

## 🏛️ Government Dashboard

The Government Dashboard demonstrates how healthcare administrators can monitor system-wide healthcare activities through analytics and AI-powered summaries.

| Username | Password |
|----------|----------|
| **goi** | **goi1234** |

### Government Dashboard Includes

- Healthcare Analytics
- Consultation Statistics
- Patient Statistics
- Doctor Statistics
- Student Statistics
- AI Insights
- Platform Usage Analytics
- Overall System Overview

---

# 💡 Recommended Testing Flow

For the best understanding of the platform, follow the sequence below.

### Step 1

Register a **Patient** account.

↓

### Step 2

Login as the **Patient** and explore the patient dashboard.

↓

### Step 3

Register or login as the **Student**.

↓

### Step 4

Open another browser and login as the **Doctor**.

↓

### Step 5

Explore the Doctor Workspace.

↓

### Step 6

Generate an AI-assisted Electronic Health Record.

↓

### Step 7

Review Patient History.

↓

### Step 8

Login as the Government user and explore the Analytics Dashboard along with AI Insights.

---

# 📹 Video Consultation Guide

The video consultation module demonstrates real-time telemedicine using **WebRTC**.

To test this feature successfully:

### Option 1 (Recommended)

Open:

- Browser 1 → Student
- Browser 2 (or Incognito Window) → Patient

Join the consultation from both accounts.

---

### Option 2

Use two different devices.

For example:

- Laptop → Student
- Mobile Phone → Patient

This provides the best real-time experience.

---

## ⚠️ Important Note

The Student account must be online before initiating the consultation.

If you wish to test the complete Patient ↔ Student video consultation workflow, kindly contact me before starting the session so that I can login as the Student and assist you during testing.

### 📞 Contact

**Mobile / WhatsApp**

```
7815873699
```

When sending a message, please include:

```
Hello!

I would like to test the Video Consultation feature.

Preferred Language:
```

This helps me coordinate the session and provide a smooth testing experience.

---

# 🔄 Typical Healthcare Workflow

The platform follows a digital healthcare workflow similar to real clinical environments.

```text
Patient Registration
        │
        ▼
Student Interaction
        │
        ▼
Doctor Consultation
        │
        ▼
AI Draft EHR Generation
        │
        ▼
Doctor Review & Approval
        │
        ▼
Patient Medical History Updated
        │
        ▼
Government Analytics Updated
        │
        ▼
AI Insights Generated
```

---

# 🔒 Authentication & Access Control

The platform follows **Role-Based Access Control (RBAC)**.

Each user can only access the modules assigned to their role.

| Role | Accessible Modules |
|------|---------------------|
| Patient | Patient Dashboard, Chat, Video Consultation, Medical History |
| Student | Student Dashboard, Chat, Video Consultation |
| Doctor | Doctor Workspace, AI EHR, Patient Management |
| Government | Analytics Dashboard, AI Insights, Statistics |

Unauthorized users cannot access restricted dashboards or protected APIs.

---

# 📂 Project Structure

The project follows a modular full-stack architecture to separate frontend, backend, APIs, database models, and static assets for better scalability and maintainability.

```text
AYUSH_Health-care-system/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── ...
│
├── server/                 # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── sockets/
│   └── ...
│
├── uploads/                # Uploaded Files
├── README.md
└── package.json
```

---

# 🔐 Security Features

The platform incorporates several security measures to ensure secure access and protect user data.

- JWT Authentication
- Password Encryption
- Protected API Routes
- Role-Based Access Control (RBAC)
- Secure Session Management
- Authentication Middleware
- Input Validation
- Secure Database Access

Each user can only access the resources assigned to their role.

---

# ☁️ Deployment

The application has been deployed using modern cloud services.

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

This architecture enables independent deployment of the frontend, backend, and database while maintaining scalability and ease of maintenance.

---

# 🚀 Future Enhancements

The current platform serves as a strong foundation for a modern AI-enabled healthcare ecosystem. Some planned enhancements include:

- 📅 Online Appointment Scheduling
- 💊 Digital Prescription Management
- 🔔 Email & SMS Notifications
- 📱 Mobile Application (Android & iOS)
- 📈 Advanced Healthcare Analytics
- 🧠 Disease Prediction Models
- 🌐 Multi-Language Support
- 📄 OCR-Based Prescription Digitization
- 🏥 Multi-Hospital Support
- ☁️ Cloud File Storage
- 🤖 Advanced Clinical AI Assistant
- 📊 Real-Time Public Health Monitoring

---

# 🌟 Project Highlights

This project demonstrates practical implementation of several modern software engineering concepts:

- Full-Stack Web Development
- RESTful API Design
- Artificial Intelligence Integration
- Electronic Health Records (EHR)
- Real-Time Communication
- Video Conferencing
- QR-Based Clinical Workflow
- Secure Authentication & Authorization
- Government Analytics Dashboard
- Cloud Deployment
- Database Management
- Responsive User Interface

---

# 🤝 Contributing

Contributions are always welcome!

If you would like to improve the project:

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

Suggestions, bug reports, and feature requests are greatly appreciated.

---

# 🐞 Known Limitations

As this project is continuously evolving, a few features are currently under active development.

- Appointment scheduling is not yet available.
- Email notifications are not integrated.
- Mobile application is not yet developed.
- Some AI outputs should be considered as clinical assistance rather than medical advice.
- Government analytics are currently generated using application data available within the platform.

---

# 👨‍💻 Developer

**Venkata Koushik Potta**

Full Stack Developer | AI & Healthcare Enthusiast

Passionate about building intelligent healthcare solutions that combine Artificial Intelligence with modern web technologies to improve digital healthcare experiences.

---

# 📬 Contact

For project discussions, collaborations, or assistance while testing the application:

📧 **Email**

```
koushik.chinu.2007@gmail.com
```

📱 **Mobile / WhatsApp**

```
7815873699
```

💼 **LinkedIn**

```

```

💻 **GitHub**

```
https://github.com/venkata-koushik
```

---

# 📄 License

This project is intended for educational, research, and demonstration purposes.

You are welcome to explore, learn from, and contribute to the project. If you use this work in your own projects or research, kindly provide appropriate attribution.

---

# ⭐ Support

If you found this project helpful or interesting:

⭐ Star this repository

🍴 Fork the repository

📢 Share your feedback

🤝 Contribute to future improvements

Your support helps improve the project and motivates future development.

---

<div align="center">

### 🏥 AI-Enabled Healthcare Management System

**Connecting Patients, Medical Students, Doctors, and Government through Artificial Intelligence, Telemedicine, and Digital Healthcare.**

**Built with ❤️ using React, Express.js, PostgreSQL, WebRTC, Socket.IO & Groq AI**

⭐ **If you like this project, consider giving it a Star!**

</div>
