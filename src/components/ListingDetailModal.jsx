import React from 'react';
import { X, MapPin, Calendar, Tag, Phone, Mail, User, Trash2, Edit } from 'lucide-react';

export default function ListingDetailModal({ 
  listing, 
  onClose, 
  onEdit, 
  onDelete, 
  currentUserId 
}) {
  if (!listing) return null;

  // בדיקה האם המשתמש המחובר הוא בעל המודעה
  const isOwner = currentUserId && listing.user_id === currentUserId;

  return (