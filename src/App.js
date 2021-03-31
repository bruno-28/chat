import React from "react";
import { createStore, combineReducers } from "redux";
import { Provider, connect } from "react-redux";
import { v4 as uuid } from "uuid";

const reducer = combineReducers({
  activeThreadId: activeThreadIdReducer,
  threads: threadsReducer,
});

function activeThreadIdReducer(state = "1-fca2", action) {
  if (action.type === "OPEN_THREAD") {
    return action.id;
  } else {
    return state;
  }
}

function threadsReducer(
  state = [
    {
      id: "1-fca2",
      title: "User #1",
      messages: messagesReducer(undefined, {}),
    },
    {
      id: "2-be91",
      title: "User #2",
      messages: messagesReducer(undefined, {}),
    },
  ],
  action
) {
  switch (action.type) {
    case "ADD_MESSAGE":
    case "DELETE_MESSAGE": {
      const threadIndex = findThreadIndex(state, action);
      const oldThread = state[threadIndex];
      const newThread = {
        ...oldThread,
        messages: messagesReducer(oldThread.messages, action),
      };

      return [
        ...state.slice(0, threadIndex),
        newThread,
        ...state.slice(threadIndex + 1, state.length),
      ];
    }
    default: {
      return state;
    }
  }
}

function findThreadIndex(threads, action) {
  switch (action.type) {
    case "ADD_MESSAGE": {
      return threads.findIndex((t) => t.id === action.threadId);
    }
    case "DELETE_MESSAGE": {
      return threads.findIndex((t) =>
        t.messages.find((m) => m.id === action.id)
      );
    }
    // no default
  }
}

function messagesReducer(state = [], action) {
  switch (action.type) {
    case "ADD_MESSAGE": {
      const newMessage = {
        text: action.text,
        timestamp: Date.now(),
        id: uuid(),
      };
      return state.concat(newMessage);
    }
    case "DELETE_MESSAGE": {
      return state.filter((m) => m.id !== action.id);
    }
    default: {
      return state;
    }
  }
}

const store = createStore(reducer);

const App = () => (
  <div className="ui container">
    <ThreadTabs />
    <ThreadDisplay />
  </div>
);

const mapStateToTabsProps = (state) => {
  const tabs = state.threads.map((t) => ({
    title: t.title,
    active: t.id === state.activeThreadId,
    id: t.id,
  }));

  return {
    tabs,
  };
};

const mapDispatchToTabsProps = (dispatch) => ({
  onClick: (id) =>
    dispatch({
      type: "OPEN_THREAD",
      id: id,
    }),
});

const Tabs = (props) => (
  <div className="ui top attached tabular menu">
    {props.tabs.map((tab, index) => (
      <div
        key={index}
        className={tab.active ? "active item" : "item"}
        onClick={() => props.onClick(tab.id)}
      >
        {tab.title}
      </div>
    ))}
  </div>
);

const ThreadTabs = connect(mapStateToTabsProps, mapDispatchToTabsProps)(Tabs);

const mapStateToThreadProps = (state) => ({
  thread: state.threads.find((t) => t.id === state.activeThreadId),
});

const mapDispatchToThreadProps = (dispatch) => ({
  onMessageClick: (id) =>
    dispatch({
      type: "DELETE_MESSAGE",
      id: id,
    }),
  dispatch: dispatch,
});

const mergeThreadProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  onMessageSubmit: (text) =>
    dispatchProps.dispatch({
      type: "ADD_MESSAGE",
      text: text,
      threadId: stateProps.thread.id,
    }),
});

const Thread = (props) => (
  <div className="ui centered aligned basic segment">
    <MessageList
      messages={props.thread.messages}
      onClick={props.onMessageClick}
    />
    <TextFieldSubmit onSubmit={props.onMessageSubmit} />
  </div>
);

const ThreadDisplay = connect(
  mapStateToThreadProps,
  mapDispatchToThreadProps,
  mergeThreadProps
)(Thread);

const MessageList = (props) => (
  <div className="ui comments">
    {props.messages.map((m, index) => (
      <div className="comment" key={index} onClick={() => props.onClick(m.id)}>
        <div className="text">
          {m.text}
          <span className="metadata">@{m.timestamp}</span>
        </div>
      </div>
    ))}
  </div>
);

class TextFieldSubmit extends React.Component {
  state = {
    value: "",
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSubmit = () => {
    this.props.onSubmit(this.state.value);
    this.setState({
      value: "",
    });
  };

  render() {
    return (
      <div className="ui input">
        <input onChange={this.onChange} value={this.state.value} type="text" />
        <button
          onClick={this.handleSubmit}
          className="ui primary button"
          type="submit"
        >
          Submit
        </button>
      </div>
    );
  }
}

const WrappedApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default WrappedApp;
