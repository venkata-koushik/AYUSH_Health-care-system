import api from "./Api";

export const createEHR = (data) => {

    return api.post("/ehr/create", data);

};