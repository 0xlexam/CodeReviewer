import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CodeReviewerApp = () => {
    const [codeSubmission, setCodeSubmission] = useState('');
    const [pendingReviews, setPendingReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/reviews/pending`);
                setPendingReviews(response.data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setErrorMessage("Failed to fetch reviews. Please try again later.");
            }
        };
        fetchReviews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/submit/code`, { code: codeSubmission });
            setCodeSubmission('');
            setErrorMessage(""); // reset error message on successful operation
        } catch (error) {
            console.error("Error submitting code:", error);
            setErrorMessage("Failed to submit code. Please try again.");
        }
    };

    const handleSelectReview = (reviewId) => {
        setSelectedReview(pendingReviews.find(review => review.id === reviewId));
        fetchComments(reviewId);
    };

    const fetchComments = async (reviewId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/reviews/${reviewId}/comments`);
            setComments(response.data);
            setErrorMessage(""); // reset error message on successful operation
        } catch (error) {
            console.error("Error fetching comments:", error);
            setErrorMessage("Failed to fetch comments. Please try again.");
        }
    };

    const handleCommentSubmit = async (reviewId, comment) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/reviews/${reviewId}/comment`, { comment });
            fetchComments(reviewId); // refresh comments to show the new one
            setErrorMessage(""); // reset error message on successful operation
        } catch (error) {
            console.error("Error submitting comment:", error);
            setErrorMessage("Failed to submit comment. Please try again.");
        }
    };

    const markReviewAsComplete = async (reviewId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/reviews/${reviewId}/complete`);
            setPendingReviews(pendingReviews.filter(review => review.id !== reviewId));
            setErrorMessage(""); // reset error message on successful operation
        } catch (error) {
            console.error("Error marking review as complete:", error);
            setErrorMessage("Failed to mark review as complete. Please try again.");
        }
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