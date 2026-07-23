import api from "./Api";

export const sendMessage = (data) =>
  api.post("/message/send", data).then((response) => response.data);

export const getMessages = (requestId, consultationType) =>
  api
    .get(`/message/${requestId}`, { params: { consultationType } })
    .then((response) => response.data);
