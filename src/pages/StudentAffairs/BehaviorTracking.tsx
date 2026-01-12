import { motion } from 'framer-motion';
import { Award, AlertCircle } from 'lucide-react';

const BehaviorTracking = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-indigo-100 rounded-full p-6 mb-6">
            <Award className="h-16 w-16 text-indigo-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            رصد السلوك
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 ml-3 mt-0.5 flex-shrink-0" />
              <div className="text-right">
                <p className="text-yellow-800 font-medium mb-1">
                  قيد التطوير
                </p>
                <p className="text-yellow-700 text-sm">
                  هذه الصفحة قيد التطوير حالياً وستكون متاحة قريباً
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 max-w-2xl">
            ستتمكن من خلال هذه الصفحة من رصد وتتبع سلوك الطلاب بشكل منظم ومهني، 
            مع إمكانية إضافة الملاحظات السلوكية الإيجابية والسلبية وتوثيقها.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BehaviorTracking;
