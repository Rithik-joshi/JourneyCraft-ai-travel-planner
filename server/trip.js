const templates={
  morning:[['Start with a scenic breakfast','Enjoy a relaxed breakfast and explore the neighborhood on foot.'],['Explore a local landmark','Visit an iconic attraction and learn about its history.'],['Nature and fresh air','Take a gentle morning walk through a scenic outdoor area.']],
  afternoon:[['Discover the local culture','Explore museums, markets or historic streets in the area.'],['Taste regional favorites','Try a local lunch spot and browse artisan shops.'],['Adventure and discovery','Choose a well-reviewed local experience suited to your interests.']],
  evening:[['Sunset viewpoints','Catch golden-hour views and take memorable photographs.'],['Food and city lights','Enjoy a regional dinner and the evening atmosphere.'],['Unwind and recharge','Take a relaxed stroll before returning to your accommodation.']]
};
export function normalizeInput(body={}){
 const destination=String(body.destination||'').trim().slice(0,80);
 const startDate=String(body.startDate||''); const endDate=String(body.endDate||'');
 const start=new Date(startDate+'T12:00:00Z'),end=new Date(endDate+'T12:00:00Z');
 const days=Math.round((end-start)/86400000)+1;
 const travelers=Number(body.travelers);
 const budget=String(body.budget||'moderate');
 const interests=Array.isArray(body.interests)?body.interests.filter(x=>typeof x==='string').slice(0,8):[];
 if(!destination||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||!Number.isFinite(days)||days<1||days>14||!Number.isInteger(travelers)||travelers<1||travelers>12||!['budget','moderate','luxury'].includes(budget)) throw new Error('Enter a destination, a 1–14 day date range, and 1–12 travelers.');
 return {destination,startDate,endDate,days,travelers,budget,interests};
}
export function makeDemoTrip(input){
 const daily=input.budget==='budget'?2300:input.budget==='luxury'?9500:4700;
 const total=daily*input.days*input.travelers;
 const days=Array.from({length:input.days},(_,i)=>({day:i+1,title:['Arrival & first impressions','Local highlights','Hidden gems','Culture & discovery','Nature escape','Food & experiences','Lasting memories'][i%7],activities:['morning','afternoon','evening'].map((period,j)=>{const [title,description]=templates[period][(i+j)%3];return {time:['9:00 AM','1:00 PM','6:00 PM'][j],title,description,cost:Math.round(daily*[0.12,0.20,0.16][j])*input.travelers,category:['Explore','Culture','Relax'][j]};})}));
 return {title:`${input.days} Days in ${input.destination}`,summary:`A thoughtfully paced ${input.days}-day escape to ${input.destination}, balancing ${input.interests.join(', ').toLowerCase()||'sightseeing and local experiences'} with time to unwind.`,destination:input.destination,startDate:input.startDate,endDate:input.endDate,travelers:input.travelers,interests:input.interests,estimatedBudget:total,budgetBreakdown:{stay:Math.round(total*.42),food:Math.round(total*.23),transport:Math.round(total*.20),activities:total-Math.round(total*.42)-Math.round(total*.23)-Math.round(total*.20)},days,tips:['Confirm opening hours, entry fees and availability before visiting.','Keep some flexibility for weather and local transport.','These are sample suggestions and approximate costs, not live bookings.']};
}
