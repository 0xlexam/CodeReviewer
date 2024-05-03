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

app.post('/api/submissions', (req: Request, res: Response) => {
  const submission: Submission = req.body;
  submissions.set(submission.id, submission);
  res.status(201).send(submission);
});

app.get('/api/submissions', (req: Request, res: Response) => {
  res.status(200).send(Array.from(submissions.values()));
});

app.post('/api/comments', (req: Request, res: Response) => {
  const comment: Comment = req.body;
  const submissionComments = comments.get(comment.submissionId) || [];
  submissionComments.push(comment);
  comments.set(comment.submissionId, submissionComments);
  res.status(201).send(comment);
});

app.get('/api/comments/:submissionId', (req: Request, res: Response) => {
  const submissionId = req.params.submissionId;
  const submissionComments = comments.get(submissionId) || [];
  res.status(200).send(submissionComments);
});

app.post('/api/reviewSessions', (req: Request, res: Response) => {
  const reviewSession: ReviewSession = req.body;
  const submissionReviewSessions = reviewSessions.get(reviewSession.submissionId) || [];
  submissionReviewSessions.push(reviewSession);
  reviewSessions.set(reviewSession.submissionId, submissionReviewSessions);
  res.status(201).send(reviewSession);
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