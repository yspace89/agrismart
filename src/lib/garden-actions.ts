'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addPlant(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const type = formData.get('type') as string;
  const location = formData.get('location') as string;
  const lightRequirement = formData.get('light_requirement') as string;
  const waterFrequency = parseInt(formData.get('water_frequency_days') as string, 10);
  const notes = formData.get('notes') as string;
  
  // New dynamic fields
  const plantingPurpose = formData.get('planting_purpose') as string || 'Hiasan';
  const quantityDescription = formData.get('quantity_description') as string;
  const plantedDate = formData.get('planted_date') as string;
  const estimatedHarvestDays = formData.get('estimated_harvest_days') ? parseInt(formData.get('estimated_harvest_days') as string, 10) : null;
  const growthStage = formData.get('growth_stage') as string;

  const photoFile = formData.get('photo') as File | null;
  let photoUrl = null;

  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/plants/${Date.now()}.${fileExt}`;
    const fileBuffer = await photoFile.arrayBuffer();

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('plant-photos')
      .upload(fileName, fileBuffer, {
        contentType: photoFile.type,
      });

    if (uploadError) {
      console.error('Error uploading plant photo:', uploadError);
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(uploadData.path);
      photoUrl = publicUrl;
    }
  }

  const { error } = await supabase
    .from('plants')
    .insert({
      created_by: user.id,
      name,
      species,
      type,
      location,
      light_requirement: lightRequirement,
      water_frequency_days: isNaN(waterFrequency) ? 1 : waterFrequency,
      notes,
      planting_purpose: plantingPurpose,
      quantity_description: quantityDescription || null,
      planted_date: plantedDate || null,
      estimated_harvest_days: isNaN(estimatedHarvestDays as number) ? null : estimatedHarvestDays,
      growth_stage: growthStage || null,
      photo_url: photoUrl,
    });

  if (error) {
    console.error('Error adding plant:', error);
    throw new Error('Failed to add plant');
  }

  revalidatePath('/plants');
  redirect('/plants');
}

export async function updatePlantStatus(plantId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('plants')
    .update({ status })
    .eq('id', plantId);

  if (error) {
    console.error('Error updating plant status:', error);
    throw new Error('Failed to update status');
  }

  revalidatePath(`/plants/${plantId}`);
}

export async function addPlantLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const plantId = formData.get('plant_id') as string;
  const actionType = formData.get('action_type') as string;
  const notes = formData.get('notes') as string;
  const photoFile = formData.get('photo') as File | null;

  let photoUrl = null;

  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}/${plantId}/${Date.now()}.${fileExt}`;
    const fileBuffer = await photoFile.arrayBuffer();

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('plant-photos')
      .upload(fileName, fileBuffer, {
        contentType: photoFile.type,
      });

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      // We continue but log the error
    } else if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(uploadData.path);
      photoUrl = publicUrl;
    }
  }

  const { error } = await supabase
    .from('plant_logs')
    .insert({
      created_by: user.id,
      plant_id: plantId,
      action_type: actionType,
      notes,
      photo_url: photoUrl,
    });

  if (error) {
    console.error('Error adding plant log:', error);
    throw new Error('Failed to add log');
  }

  revalidatePath(`/plants/${plantId}`);
}

export async function updatePlantVitals(
  plantId: string, 
  waterFrequency: number, 
  lightRequirement: string, 
  plantedDate: string,
  autoReminder?: { enabled: boolean; hour?: number; minute?: number; next_send_at?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('plants')
    .update({ 
      water_frequency_days: waterFrequency,
      light_requirement: lightRequirement,
      planted_date: plantedDate || null
    })
    .eq('id', plantId);

  if (error) {
    console.error('Error updating plant vitals:', error);
    throw new Error('Failed to update vitals');
  }

  if (autoReminder && user) {
    if (autoReminder.enabled && autoReminder.hour !== undefined) {
      // Upsert Siram reminder
      const { data: existing } = await supabase
        .from('reminders')
        .select('id')
        .eq('plant_id', plantId)
        .eq('activity_type', 'Siram')
        .maybeSingle();

      if (existing) {
        await supabase.from('reminders').update({
          frequency_days: waterFrequency,
          notification_hour: autoReminder.hour,
          notification_minute: autoReminder.minute || 0,
          next_send_at: autoReminder.next_send_at || null,
          is_active: true
        }).eq('id', existing.id);
      } else {
        await supabase.from('reminders').insert({
          user_id: user.id,
          plant_id: plantId,
          activity_type: 'Siram',
          frequency_days: waterFrequency,
          notification_hour: autoReminder.hour,
          notification_minute: autoReminder.minute || 0,
          next_send_at: autoReminder.next_send_at || null,
          is_active: true
        });
      }
    } else {
      // Delete existing Siram reminder if toggled off
      await supabase.from('reminders')
        .delete()
        .eq('plant_id', plantId)
        .eq('activity_type', 'Siram');
    }
  }

  revalidatePath(`/plants/${plantId}`);
}
