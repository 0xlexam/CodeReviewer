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

let submissions: Submission[] = [];
let comments: Comment[] = [];
let reviewSessions: ReviewSession[] = [];

app.post('/api/submissions', (req: Request, res: Response) => {
  const submission: Submission = req.body;
  submissions.push(submission);
  res.status(201).send(submission);
});

app.get('/api/submissions', (req: Request, res: Response) => {
  res.status(200).send(submissions);
});

app.post('/api/comments', (req: Request, res: Response) => {
  const comment: Comment = req.body;
  comments.push(comment);
  res.status(201).send(comment);
});

app.get('/api/comments/:submissionId', (req: Request, res: Response) => {
  const submissionId = req.params.submissionId;
  const submissionComments = comments.filter(comment => comment.submissionId === submissionId);
  res.status(200).send(submissionComments);
});

app.post('/api/reviewSessions', (req: Request, res: Response) => {
  const reviewSession: ReviewSession = req.body;
  reviewSessions.push(reviewSession);
  res.status(201).send(reviewSession);
});

app.get('/api/reviewSessions', (req: Request, res: Response) => {
  res.status(200).send(reviewSessions);
});

app.get('/api/reviewSessions/:submissionId', (req: Request, res: Response) => {
  const submissionId = req.params.submissionId;
  const submissionReviewSessions = reviewSessions.filter(session => session.submissionId === submissionId);
  res.status(200).send(submissionReviewSessions);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});