import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CodeReviewerApp = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    const [codeSubmission, setCodeSubmission] = useState('');
    const [pendingReviews, setPendingReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const apiCall = async (method, path, data = {}) => {
        try {
            const response = await axios[method](`${API_URL}${path}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error during ${path}:`, error);
            setErrorMessage(`Failed at ${path}. Please try again.`);
            throw error;
        }
    };

    const fetchReviews = async () => {
        const data = await apiCall('get', '/reviews/pending');
        setPendingReviews(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await apiCall('post', '/submit/code', { code: codeSubmission });
        setCodeSubmission('');
        setErrorMessage("");
    };

    const handleSelectReview = async (reviewId) => {
        setSelectedReview(pendingReviews.find(review => review.id === reviewId));
        await fetchComments(reviewId);
    };

    const fetchComments = async (reviewId) => {
        const data = await apiCall('get', `/reviews/${reviewId}/comments`);
        setComments(data);
    };

    const handleCommentSubmit = async (reviewId, comment) => {
        await apiCall('post', `/reviews/${reviewId}/comment`, { comment });
        fetchComments(reviewId);
    };

    const markReviewAsComplete = async (reviewId) => {
        await apiCall('put', `/reviews/${reviewId}/complete`);
        setPendingReviews(pendingReviews.filter(review => review.id !== reviewId));
    };

    return (
        <div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <textarea value={codeSubmission} onChange={(e) => setCodeSubmission(e.target.value)} />
                <button type="submit">Submit Code for Review</button>
            </form>
            <h2>Pending Reviews</h2>
            <ul>
                {pendingReviews.map(review => (
                    <li key={review.id} onClick={() => handleSelectReview(review.id)}>
                        {review.title}
                    </li>
                ))}
            </ul>
            {selectedReview && (
                <div>
                    <h3>Comments for {selectedReview.title}</h3>
                    {comments.map(comment => (
                        <p key={comment.id}>{comment.text}</p>
                    ))}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const commentText = e.target.elements.comment.value;
                        handleCommentSubmit(selectedReview.id, commentText);
                        e.target.reset();
                    }}>
                        <input name="comment" type="text" placeholder="Leave a comment" />
                        <button type="submit">Comment</button>
                    </form>
                    <button onClick={() => markReviewAsComplete(selectedReview.id)}>Mark Review as Complete</button>
                </div>
            )}
        </div>
    );
};

export default CodeReviewerApp;