class DummyUser:
    def __init__(self):
        self.c_users = []

    def join_user(self, id, username, room):
        p_user = {"id": id, "username": username, "room": room}
        self.c_users.append(p_user)
        return p_user

    def get_current_user(self, id):
        return next((p_user for p_user in self.c_users if p_user["id"] == id), None)

    def user_disconnect(self, id):
        p_user = self.get_current_user(id)
        if p_user:
            self.c_users.remove(p_user)
        return p_user

dummy_user = DummyUser()
