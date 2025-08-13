// Import required libraries
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

// --- Configuration ---
// Initialize Stripe with your secret key (from environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Prepare Firebase credentials (from environment variables)
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK if not already initialized
if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

// --- The Webhook Handler ---
export default async function handler(req, res) {
  // We only care about POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Get the signature from the request headers
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Use Stripe's library to construct the event and verify the signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    // Handle verification errors
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // --- Handle the specific event type ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; // This is the Firebase UID you sent

    if (!userId) {
      console.error('Error: Missing client_reference_id in Stripe session.');
      return res.status(400).send('Error: Missing user ID.');
    }

    // This is where you'll define what the user gets
    // For example, if it's the bundle:
    const isBundle = session.metadata.bundle === 'true'; 
    // Or a specific course:
    const courseId = session.metadata.courseId;

    try {
      // Get a reference to the user's document in Firestore
      const userRef = db.collection('users').doc(userId);
      
      // Update the user's document to grant access
      if (isBundle) {
        await userRef.update({ bundlePurchased: true });
        console.log(`Granted bundle access to user: ${userId}`);
      } else if (courseId) {
        // Here you would add the courseId to a 'purchasedCourses' array
        // await userRef.update({ purchasedCourses: FieldValue.arrayUnion(courseId) });
        console.log(`Granted access to course ${courseId} for user: ${userId}`);
      }
      
    } catch (error) {
      console.error('Firestore update error:', error);
      return res.status(500).send('Error updating user record.');
    }
  }

  // --- Acknowledge receipt of the event ---
  res.status(200).json({ received: true });
}
