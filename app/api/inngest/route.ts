import { Inngest } from "inngest";
import { serve } from "inngest/next";
import { db } from '@/lib/db'
import { getVirtuousBatches} from '@/lib/virGifts'
import { syncBatchGifts } from '@/lib/feGiftBatches'
import { getBatches } from "@/lib/virGifts";

// Create a client to send and receive events
export const inngest = new Inngest({ name: "DonorSync" });



const helloWorld = inngest.createFunction(
  { name: "Hello World" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("1s");
    return { event, body: "Hello, World!" };
  }
);


// This automate getting batches function will run at daily 12:00pm 
export const prepareAutomation = inngest.createFunction(
  { name: "Prepare List of Accounts for Automation" },
  { event: "app/prepare" },
  async ({ step }) => {
    // Load all the users from your database:
    const teams = await step.run("Load teams", async() =>await db.team.findMany({
      where: {
        automation: true,
      },
      select: { 
        id: true,
        name: true,
        automation: true,
      }
    }));

    // ✨ This is known as a "fan-out" pattern ✨

    // 1️⃣ First, we'll create an event object for every user return in the query:
    const events = teams.map((team) => {
      return {
        name: "app/load.batches",
        data: {
          team_id: team.id,
          name: team.name,
        }
      }
    });

    // 2️⃣ Now, we'll send all events in a single batch:
    await step.sendEvent(events);

    return { count: teams.length };
  }
);

// This is a regular Inngest function that will process batches for 
// every event that is received (see the above function's inngest.send())

// Since we are "fanning out" with events, these functions can all run in parallel
export const loadBatches = inngest.createFunction(
  { name: "Update Virtuous Batches" },
  { event: "app/load.batches" },
  async ({ event, step }) => {
  
    // 3️⃣ We can now grab the email and user id from the event payload
    const { name, team_id } = event.data;
  
    // 4️⃣ Finally, prcoess batches
    const team = {id: team_id, }; 
    const batches =  await getVirtuousBatches(team_id)
    const unSyncedBatches = batches.filter(batch => !batch.synced);
    console.log('unSyncedBatches')
    console.log(unSyncedBatches);
  
    //  map batches that are not synced and trigger sync function
    
   
    const events = await unSyncedBatches.map((batch) => {
      return {
        name: "app/sync.batches",
        data: {
          team_id: team.id,
          batch_id: batch.id,
        }
      }
    }
    );
    await step.sendEvent(events);
  })


export const syncBatches = inngest.createFunction(
  { name: "Sync Virtuous Batches" },
  { event: "app/sync.batches" },
  async ({ event }) => {
    // 3️⃣ We can now grab the batch id and user id from the event payload
    const {  team_id, batch_id } = event.data;
    console.log('syncing batch')
    // 4️⃣ Finally, we actually synch the batch
    const team = {id: team_id, }; 
    await syncBatchGifts(team_id, batch_id)
    
    
    // 🎇 That's it! - We've used two functions to reliably perform a scheduled
    // task for a large list of users!
  },
)





// Create an API that serves zero functions






export const { GET, POST, PUT } = serve(inngest, [
  helloWorld,
  prepareAutomation,
  loadBatches,
  syncBatches,
], { streaming: "allow",});