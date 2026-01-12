import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';

const GuidanceReferral = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-purple-100 rounded-full p-6 mb-6">
            <Users className="h-16 w-16 text-purple-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تحويل للتوجيه الطلابي
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
            من خلال هذه الصفحة يمكنك تحويل الطلاب إلى المرشد الطلابي 
            مع توثيق الأسباب والملاحظات ومتابعة الحالات.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GuidanceReferral;
