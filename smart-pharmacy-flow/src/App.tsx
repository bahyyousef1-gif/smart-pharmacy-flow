import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Navigation/Sidebar';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import SmartOrdering from './components/Orders/SmartOrdering';
import OrderDashboard from './components/P2P/OrderDashboard';
import P2POrderingModule from './components/P2P/P2POrderingModule';
import LiveTimeline from './components/P2P/LiveTimeline';
import OrderNotification from './components/P2P/OrderNotification';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Sidebar />
        <main>
          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/smart-ordering" component={SmartOrdering} />
            <Route path="/p2p/orders" component={OrderDashboard} />
            <Route path="/p2p/ordering" component={P2POrderingModule} />
            <Route path="/p2p/live-timeline" component={LiveTimeline} />
            <Route path="/p2p/notifications" component={OrderNotification} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;