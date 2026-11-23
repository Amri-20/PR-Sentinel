
function getUser(userId) {
    const query = "SELECT * FROM users WHERE id=" + userId;
    return query;
}

console.log(getUser(10));
