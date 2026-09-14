# Product_recommend.sys
A sophisticated e-commerce product recommendation platform built with React and FastAPI, featuring hybrid recommendation algorithms, intelligent product categorization, and a user-friendly interface.

## 🎯 Project Overview

This system implements a modern product recommendation engine that combines rule-based logic with AI/ML enhancements to deliver personalized shopping experiences. The platform supports both administrative product management and customer-facing recommendation features.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-recommender
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Initialize Database**
   ```bash
   python seed_data.py
   ```

4. **Start Backend Server**
   ```bash
   python main.py
   # Server runs on http://localhost:8000
   ```

5. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   # Frontend runs on http://localhost:3000
   ```

### Access Points
- **Frontend Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health
