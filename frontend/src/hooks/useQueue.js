import { useState } from "react";
import { queueAPI } from "../api";

export const useQueue = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const { data } = await queueAPI.getAllQueues();
      setQueues(data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createQueue = async (queueData) => {
    try {
      const { data } = await queueAPI.createQueue(queueData);
      setQueues(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  const joinQueue = async (id) => {
    try {
      await queueAPI.joinQueue(id);
      await fetchQueues(); // обновляем список очередей
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  const serveNext = async (id) => {
    try {
      await queueAPI.serveNext(id);
      await fetchQueues();
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  return { queues, loading, error, fetchQueues, createQueue, joinQueue, serveNext };
};
