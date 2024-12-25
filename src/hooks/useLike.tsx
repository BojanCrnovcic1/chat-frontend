import { useState } from "react";
import axios from "axios";
import { LikeType } from "../types/LikeType";
import { ApiConfig } from "../config/ApiConfig";
import { useAuth } from "../context/AuthContext";

export const useLike = () => {
  const [like, setLike] = useState<LikeType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0); // Držimo broj lajkova
  const { token } = useAuth();

  const fetchLikeCount = async (messageId: number) => {
    try {
      const response = await axios.get(ApiConfig.API_URL + `api/message/likes${messageId}`);
      setLikeCount(response.data); 
      console.log('likes likeCount: ', response.data.likeCount)
      console.log('likes: ', response.data)
    } catch (err) {
      setError("Failed to fetch like count.");
      console.error(err);
    }
  };

  const addLike = async (messageId: number, userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<LikeType>(ApiConfig.API_URL + `api/message/like/${messageId}`, {
        userId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
         setLike(response.data);
      setLikeCount((prevCount) => prevCount + 1);
      console.log('add like: ', response.data);
      }
     
    } catch (err) {
      setError("Failed to add like.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeLike = async (messageId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete<LikeType>(ApiConfig.API_URL + `api/message/dislike/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLike(null);
      setLikeCount((prevCount) => prevCount - 1);
      console.log('remove like: ', response.data);
    } catch (err) {
      setError("Failed to remove like.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { like, likeCount, addLike, removeLike, loading, error, fetchLikeCount };
};
