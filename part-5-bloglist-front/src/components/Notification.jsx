const Notification = ({ notification }) => {
  if (!notification) {
    return null;
  }

  return (
    <div className="notificationContainer">
      <div
        className={`notification ${
          notification.type ? notification.type : "success"
        }`}
      >
        {notification.message}
      </div>
    </div>
  );
};

export default Notification;
