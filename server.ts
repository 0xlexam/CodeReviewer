import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

interface Submission {
    id: string;
    code: string;
    language: string;
}

interface Comment {
    id: string;
    submissionId: string;
    content: string;
}

interface ReviewSession {
    id: string;
    submissionId: string;
    status: 'OPEN' | 'CLOSED';
}

let submissions: Map<string, Submission> = new Map();
let comments: Map<string, Comment[]> = new Map();
let reviewSessions: Map<string, ReviewSession[]> = new Map();

function validateEntity(entity: any, fields: string[], entityType: string) {
    for (const field of fields) {
        if (!(field in entity)) {
            throw new Error(`Missing field(s) in the ${entityType}`);
        }
    }
}

app.post('/api/submissions', (req: Request, res: Response) => {
    try {
        const submission: Submission = req.body;
        validateEntity(submission, ['id', 'code', 'language'], 'submission');
        submissions.set(submission.id, submission);
        res.status(201).send(submission);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/api/submissions', (req: Request, res: Response) => {
    res.status(200).send(Array.from(submissions.values()));
});

app.post('/api/comments', (req: Request, res: Response) => {
    try {
        const comment: Comment = req.body;
        validateEntity(comment, ['id', 'submissionId', 'content'], 'comment');
        const submissionComments = comments.get(comment.submissionId) || [];
        submissionComments.push(comment);
        comments.set(comment.submissionId, submissionComments);
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/api/comments/:submissionId', (req: Request, res: Response) => {
    const submissionId = req.params.submissionId;
    const submissionComments = comments.get(submissionId) || [];
    res.status(200).send(submissionComments);
});

app.post('/api/reviewSessions', (req: Request, res: Response) => {
    try {
        const reviewSession: ReviewSession = req.body;
        validateEntity(reviewSession, ['id', 'submissionId', 'status'], 'review session');
        const submissionReviewSessions = reviewSessions.get(reviewSession.submissionId) || [];
        submissionReviewSessions.push(reviewSession);
        reviewSessions.set(reviewSession.submissionId, submissionReviewSessions);
        res.status(201).send(reviewSession);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/api/reviewSessions', (req: Request, res: Response) => {
    const allSessions = Array.from(reviewSessions.values()).flat();
    res.status(200).send(allSessions);
});

app.get('/api/reviewSessions/:submissionId', (req: Request, res: Response) => {
    const submissionId = req.params.submissionId;
    const submissionReviewSessions = reviewSessions.get(submissionId) || [];
    res.status(200).send(submissionReviewSessions);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});