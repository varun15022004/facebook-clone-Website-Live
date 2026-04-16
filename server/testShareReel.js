import { createMessage } from './models/Message.js';
import { createNotification } from './models/Notification.js';

async function test() {
  try {
    // These need to be actual UUIDs from the neonDB to not violate foreign key constraints.
    // So let's grab random users from the DB.
    const pool = (await import('./db/pool.js')).default;
    const { rows } = await pool.query('SELECT id FROM users LIMIT 2');
    
    if (rows.length < 2) {
      console.log('Not enough users.');
      process.exit();
    }
    
    const userId = rows[0].id;
    const friendId = rows[1].id;
    const reelId = 'test-reel-id'; // just for string

    console.log(`Using sender: ${userId}, recipient: ${friendId}`);

    console.log('Testing createNotification...');
    await createNotification({
      recipientId: friendId,
      senderId: userId,
      type: 'reel_share'
    });
    console.log('createNotification success');

    console.log('Testing createMessage...');
    await createMessage({
      senderId: userId,
      recipientId: friendId,
      content: `Check out this reel: http://localhost:5173/reels/${reelId}`,
      attachments: []
    });
    console.log('createMessage success');

  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    process.exit();
  }
}

test();
