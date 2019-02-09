import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Whiteboard from './Whiteboard.jsx';
import * as serviceWorker from './serviceWorker';

class Test extends React.Component {
  render() {
    return (
      <div>
        <Whiteboard />
        <Whiteboard />
      </div>
    )
  }
}

ReactDOM.render(<Test />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
