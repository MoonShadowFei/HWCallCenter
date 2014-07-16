using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;

namespace HWCallCenter
{
    public class Log
    {
        static public void log(string logMessage)
        {
            //Configuration config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);

            //AppSettingsSection app = config.AppSettings;

            //string logFileName = @"C:\Log\log.txt";
            string logFileName = AppDomain.CurrentDomain.BaseDirectory + @"\Log\log.txt";

            FileStream fs = new FileStream(logFileName, FileMode.OpenOrCreate, FileAccess.Write);
            {
                StreamWriter m_streamWriter = new StreamWriter(fs);
                m_streamWriter.BaseStream.Seek(0, SeekOrigin.End);
                m_streamWriter.WriteLine(string.Format("[{0}] {1}", DateTime.Now.ToString(), logMessage));
                m_streamWriter.Flush();
                m_streamWriter.Close();
                fs.Close();
            }
        }

        static public void log(string _filePrefix, string _logInfo)
        {
            string logFileName = AppDomain.CurrentDomain.BaseDirectory + @"\Log\" + _filePrefix + "_log_" + DateTime.Now.ToShortDateString().Replace('/', '-') + ".txt";

            FileStream fs = new FileStream(logFileName, FileMode.OpenOrCreate, FileAccess.Write);
            {
                StreamWriter m_streamWriter = new StreamWriter(fs);
                m_streamWriter.BaseStream.Seek(0, SeekOrigin.End);
                m_streamWriter.WriteLine(string.Format("[{0}] {1}", DateTime.Now.ToString(), _logInfo));
                m_streamWriter.Flush();
                m_streamWriter.Close();
                fs.Close();
            }

        }

    }
}