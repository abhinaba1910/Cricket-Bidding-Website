import React, { useState } from 'react';
import { X, User, DollarSign, Users, Clock } from 'lucide-react';

const RTMApprovalPopup = ({ 
  rtmRequest, 
  onApprove, 
  onReject, 
  onClose,
  isProcessing = false 
}) => {
  const [decision, setDecision] = useState(null);

  const handleApprove = () => {
    setDecision('approve');
    onApprove();
  };

  const handleReject = () => {
    setDecision('reject');
    onReject();
  };

  if (!rtmRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">RTM Request</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Player Info */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <User className="text-blue-600" size={20} />
            <div>
              <p className="font-medium text-gray-800">Player</p>
              <p className="text-sm text-gray-600">{rtmRequest.playerName}</p>
            </div>
          </div>

          {/* Team Info */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Users className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-gray-800">Requesting Team</p>
              <p className="text-sm text-gray-600">{rtmRequest.teamName}</p>
            </div>
          </div>

          {/* Bid Amount */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <DollarSign className="text-orange-600" size={20} />
            <div>
              <p className="font-medium text-gray-800">Bid Amount</p>
              <p className="text-sm text-gray-600">₹{rtmRequest.bidAmount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="text-gray-600" size={20} />
            <div>
              <p className="font-medium text-gray-800">Requested At</p>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Decision Message */}
        <div className="text-center mb-6">
          <p className="text-gray-700 font-medium">
            Do you want to allow this RTM transfer?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            This action cannot be undone
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              decision === 'reject' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {decision === 'reject' && isProcessing ? 'Rejecting...' : 'Reject'}
          </button>
          
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              decision === 'approve' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {decision === 'approve' && isProcessing ? 'Approving...' : 'Approve'}
          </button>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing request...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RTMApprovalPopup;