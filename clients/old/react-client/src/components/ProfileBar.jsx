import React, { useState, useEffect } from 'react';
import { useAppContext } from './../AppContext';

export function ProfileBar() {
  const { user: userPromise } = useAppContext();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (userPromise && typeof userPromise.then === 'function') {
      userPromise.then(resolvedUser => {
        if (isMounted) setUser(resolvedUser);
      });
    } else {
      setUser(userPromise);
    }

    return () => {
      isMounted = false;
    };
  }, [userPromise]);

  if (!user) {
    return null; // или скелетон
  }

  console.log("User in <ProfileBar/>:", user);

  return (
    <div>
      <div style={styles.avatar}>
        {user.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <div style={styles.info}>
        <div style={styles.username}>{user.username}</div>
        {user.id && <div style={styles.id}>Id: {user.id}</div>}
        {user.tag && <div style={styles.tag}>#{user.tag}</div>}
      </div>
    </div>
  );
}

const styles = {
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#5865f2',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 12,
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
  username: {
    fontWeight: 600,
    fontSize: 16,
  },
  tag: {
    fontWeight: 400,
    fontSize: 14
  },
  id: {
    fontWeight: 400,
    fontSize: 14,
    color: '#999',
  }
};
