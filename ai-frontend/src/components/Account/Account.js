import React, { useState } from 'react';

const Account = () => {
  const [userInfo, setUserInfo] = useState({
    firstname: 'Amit',
    lastname: 'Mahajan',
    email: 'amitmahajan274@gmail.com'
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement user info update logic
    console.log('User info updated:', userInfo);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement password change logic
    console.log('Password change submitted:', password);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Account</h1>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <span style={{ marginRight: '15px' }}>Settings</span>
        {/* <span style={{ marginRight: '15px' }}>Your Plan</span> */}
        <span style={{ marginRight: '15px', borderBottom: '2px solid #6366f1', color: '#6366f1' }}>User Info</span>
        {/* <span style={{ marginRight: '15px' }}>API Keys</span>
        <span style={{ marginRight: '15px' }}>Integration Settings</span> */}
        {/* <span>Refer a Friend</span> */}
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        <div>
          <h2>User Info</h2>
          <form onSubmit={handleUserInfoSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="firstname" style={{ display: 'block', marginBottom: '5px' }}>Firstname</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={userInfo.firstname}
                onChange={handleUserInfoChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="lastname" style={{ display: 'block', marginBottom: '5px' }}>Lastname</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={userInfo.lastname}
                onChange={handleUserInfoChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <button type="submit" style={{ backgroundColor: '#6366f1', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          </form>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2>Change Your Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="current-password" style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
              <input
                type="password"
                id="current-password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="new-password" style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
              <input
                type="password"
                id="new-password"
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div className="password-requirements">
              <h3>Password Requirements:</h3>
              <ul>
                <li>Minimum of 8 characters</li>
                <li>At least 1 UPPERCASE</li>
                <li>At least 1 lowercase</li>
                <li>At least 1 digit</li>
                <li>At least 1 special character</li>
              </ul>
            </div>
            <button type="submit" style={{ backgroundColor: '#6366f1', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
