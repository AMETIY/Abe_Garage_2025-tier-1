// Import react
import React, { Suspense, lazy } from "react";
// Import the Routes and Route components from react-router
import { Routes, Route } from "react-router";
// Import error handling components
import ErrorBoundary from "./markup/components/ErrorBoundary/ErrorBoundary";
import NotificationContainer from "./markup/components/Notifications/NotificationContainer";
// Import the App Context Provider
import { AppProvider } from "./Contexts/AppContext";

// Import the css files
import "./assets/template_assets/css/bootstrap.css";
import "./assets/template_assets/css/style.css";
import "./assets/template_assets/css/responsive.css";
import "./assets/template_assets/css/color.css";

// Import the custom css file
import "./assets/styles/custom.css";

// Import asset optimization components
import {
  AssetPreloader,
  FontOptimizer,
} from "./components/AssetOptimizer/index.js";

// Import the Header component
import Header from "./markup/components/Header/Header";
// Import the Footer component
import Footer from "./markup/components/Footer/Footer";

// Import the PrivateAuthRoute component
import PrivateAuthRoute from "./markup/components/Auth/PrivateAuthRoute";

// Lazy load components for code splitting
const Home = lazy(() => import("./markup/pages/Home"));
const Login = lazy(() => import("./markup/pages/Login"));
const Unauthorized = lazy(() => import("./markup/pages/Unauthorized"));
const Services = lazy(() => import("./markup/pages/Services"));
const AboutPage = lazy(() => import("./markup/pages/AboutPage"));
const Contact = lazy(() => import("./markup/pages/Contact"));
const FourO4 = lazy(() => import("./markup/pages/404"));

// Admin pages - lazy loaded
const AdminPage = lazy(() => import("./markup/pages/admin/AdminPage"));
const AddEmployee = lazy(() => import("./markup/pages/admin/AddEmployee"));
const Orders = lazy(() => import("./markup/pages/admin/Orders"));
const Customers = lazy(() => import("./markup/pages/admin/Customers"));
const Employees = lazy(() => import("./markup/pages/admin/Employees"));
const AddNewCustomerPage = lazy(() =>
  import("./markup/pages/admin/AddNewCustomer")
);
const EditCustomer = lazy(() => import("./markup/pages/admin/EditCustomer"));
const AddVehiclePage = lazy(() =>
  import("./markup/pages/admin/AddVehiclePage")
);
const Vehicle = lazy(() =>
  import("./markup/components/Admin/Vehicles/Vehicle")
);
const ServiceListPage = lazy(() =>
  import("./markup/pages/admin/ServiceListPage")
);
const PerformancePage = lazy(() =>
  import("./markup/pages/admin/PerformancePage")
);
const OrdersTwo = lazy(() => import("./markup/pages/admin/OrderesTwo"));
const OrdersThree = lazy(() => import("./markup/pages/admin/OrdersThree"));
const OrdersFour = lazy(() => import("./markup/pages/admin/OrderFour"));
const OrderDetail = lazy(() =>
  import("./markup/components/OrderDetail/OrderDetail")
);
const TrackOrderPopup = lazy(() =>
  import("./markup/components/TrackOrder/TrackOrder")
);
const EmployeeUpdatePage = lazy(() =>
  import("./markup/pages/admin/EmployeeUpdatePage")
);

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  // Initialize auth cleanup on app startup (temporarily disabled)
  // useEffect(() => {
  //   initializeAuth();
  // }, []);

  // Critical assets to preload
  const criticalAssets = [
    { type: "image", src: "/src/assets/images/logo.png" },
    { type: "font", family: "CerebriSans" },
    { type: "image", src: "/src/assets/images/custom/logo.png" },
  ];

  return (
    <AppProvider>
      <ErrorBoundary name="AppErrorBoundary">
        <AssetPreloader
          criticalAssets={criticalAssets}
          onLoadComplete={() => console.info("🎯 Critical assets loaded")}
        >
          <FontOptimizer preload={true}>
            <Header />
            <NotificationContainer />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/service" element={<Services />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/trackorder" element={<TrackOrderPopup />} />

                <Route
                  path="/admin"
                  element={
                    <PrivateAuthRoute roles={[2, 3]}>
                      <AdminPage />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/vehicle"
                  element={
                    <PrivateAuthRoute>
                      <Vehicle />
                    </PrivateAuthRoute>
                  }
                />

                <Route
                  path="/admin/add-customer"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <AddNewCustomerPage />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/customer/edit/:id"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <EditCustomer />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/customers/:id"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <AddVehiclePage />
                    </PrivateAuthRoute>
                  }
                />

                <Route
                  path="/admin/order"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <Orders />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/orderstwo/:id"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <OrdersTwo />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/ordersthree/:c_id/:v_id"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <OrdersThree />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <OrdersFour />
                    </PrivateAuthRoute>
                  }
                />
                <Route path="/admin/order/:id" element={<OrderDetail />} />

                <Route
                  path="/admin/services"
                  element={
                    <PrivateAuthRoute roles={[1, 2, 3]}>
                      <ServiceListPage />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/performance"
                  element={
                    <PrivateAuthRoute roles={[3]}>
                      <PerformancePage />
                    </PrivateAuthRoute>
                  }
                />
                {/* // Add the Service List Route  */}

                {/* // Add the Customers Route  */}
                <Route
                  path="/admin/customers"
                  element={
                    <PrivateAuthRoute roles={[2, 3]}>
                      <Customers />
                    </PrivateAuthRoute>
                  }
                />
                {/* // Add the Employees Route  */}
                <Route
                  path="/admin/employees"
                  element={
                    <PrivateAuthRoute roles={[2, 3]}>
                      <Employees />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/employee/edit/:id"
                  element={
                    <PrivateAuthRoute roles={[3]}>
                      <EmployeeUpdatePage />
                    </PrivateAuthRoute>
                  }
                />
                <Route
                  path="/admin/add-employee"
                  element={
                    <PrivateAuthRoute roles={[3]}>
                      <AddEmployee />
                    </PrivateAuthRoute>
                  }
                />
                {/* 
            Customers (/admin/customers) - managers and admins
            Orders (/admin/orders) - Can be accessed by all employees
            Add employee (/admin/add-employee) - admins only 
              - Admin: 3 
              - Manager: 2 
              - Employee: 1 
          */}

                <Route path="*" element={<FourO4 />} />
              </Routes>
            </Suspense>
            <Footer />
          </FontOptimizer>
        </AssetPreloader>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
