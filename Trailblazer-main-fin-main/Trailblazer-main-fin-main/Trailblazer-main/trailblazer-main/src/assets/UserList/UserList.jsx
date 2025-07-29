import axios from "axios";
import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8080/api/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>User List</h1>
      {users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}

export default UserList;
