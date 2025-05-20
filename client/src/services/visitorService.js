import api from "../api/api.js";
import { VisitorTypeEnum } from "../enums/enums.js";

export const getVisitorByUserId = async (userId) => {
  const response = await api.get(`/api/get-visitor-by-user/${userId}`);
  return response.data.data || [];
};

export const searchVisitor = async (query) => {
  const params = new URLSearchParams(query).toString();
  const response = await api.get(`/api/search-visitor?${params}`);
  return response.data || [];
};

export const createVisitor = async (formData) => {
  const response = await api.post("/api/create-visitor", formData);
  return response.data.data || [];
};

export const getVisitorNames = async (visitorType, userId) => {
  try {
    const response = await api.get(`/api/visitors-names/${userId}?type=${visitorType}`);
    const data = response.data;

    if (visitorType === VisitorTypeEnum.INDIVIDUAL) {
      return data.map((visitor) => ({
        value: `${visitor.firstName}-${visitor.lastName}`,
        label: `${visitor.firstName} ${visitor.lastName}`,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
      }));
    } else {
      return data.map((group) => ({
        value: group.groupName,
        label: group.groupName,
        groupName: group.groupName,
      }));
    }
  } catch (error) {
    console.error("Error fetching visitor names:", error);
    return [];
  }
};

export const createVisitorDetail = async (formData) => {
  const response = await api.post("/api/create-visitors-detail", formData);
  return response;
};

export const getVisitorDetailById = async (id) => {
  const response = await api.get(`/api/get-visitor/${id}`);
  return response.data;
};

export const updateVisitor = async (userId, formData) => {
  const response = await api.put(`/api/update-visitor/${userId}`, formData);
  return response;
};

export const deleteVisitDetail = async (id) => {
  const response = await api.delete(`/api/delete-visitor-detail/${id}`);
  return response;
};